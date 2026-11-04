import { expect } from "chai";
import hre, { network } from "hardhat";
import { upgrades } from "@openzeppelin/hardhat-upgrades";

const connection = await network.create();
const { ethers } = connection;
const upgradesApi = await upgrades(hre, connection);

async function deployPlasticoTokenFixture() {
  const [admin, minter, otherAccount] = await ethers.getSigners();

  const PlasticoToken = await ethers.getContractFactory("PlasticoToken");
  const token = await upgradesApi.deployProxy(PlasticoToken, [
    "Plastico Token",
    "PLST",
    admin.address,
  ]);
  await token.waitForDeployment();

  const MINTER_ROLE = await token.MINTER_ROLE();
  const PAUSER_ROLE = await token.PAUSER_ROLE();
  const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();

  // Otorgamos MINTER_ROLE a una cuenta distinta del admin para probar el control de acceso
  await token.connect(admin).grantRole(MINTER_ROLE, minter.address);

  return { token, admin, minter, otherAccount, MINTER_ROLE, PAUSER_ROLE, DEFAULT_ADMIN_ROLE };
}

describe("PlasticoToken", function () {
  it("inicializa nombre, simbolo y roles del admin", async function () {
    const { token, admin, DEFAULT_ADMIN_ROLE, PAUSER_ROLE, MINTER_ROLE } =
      await connection.networkHelpers.loadFixture(deployPlasticoTokenFixture);

    expect(await token.name()).to.equal("Plastico Token");
    expect(await token.symbol()).to.equal("PLST");
    expect(await token.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.equal(true);
    expect(await token.hasRole(PAUSER_ROLE, admin.address)).to.equal(true);
    expect(await token.hasRole(MINTER_ROLE, admin.address)).to.equal(true);
  });

  it("permite mintear a una cuenta con MINTER_ROLE y emite TokensMinteados", async function () {
    const { token, minter, otherAccount } = await connection.networkHelpers.loadFixture(
      deployPlasticoTokenFixture,
    );

    await expect(token.connect(minter).mint(otherAccount.address, 1000n, 42n))
      .to.emit(token, "TokensMinteados")
      .withArgs(otherAccount.address, 1000n, 42n);

    expect(await token.balanceOf(otherAccount.address)).to.equal(1000n);
  });

  it("revierte si una cuenta sin MINTER_ROLE intenta mintear", async function () {
    const { token, otherAccount } = await connection.networkHelpers.loadFixture(
      deployPlasticoTokenFixture,
    );

    await expect(
      token.connect(otherAccount).mint(otherAccount.address, 1000n, 1n),
    ).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
  });

  it("permite quemar tokens solo a MINTER_ROLE", async function () {
    const { token, minter, otherAccount } = await connection.networkHelpers.loadFixture(
      deployPlasticoTokenFixture,
    );

    await token.connect(minter).mint(otherAccount.address, 500n, 1n);
    await token.connect(minter).burnFrom(otherAccount.address, 200n);

    expect(await token.balanceOf(otherAccount.address)).to.equal(300n);

    await expect(
      token.connect(otherAccount).burnFrom(otherAccount.address, 100n),
    ).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
  });

  it("pause/unpause solo permitido a PAUSER_ROLE y bloquea transferencias mientras esta pausado", async function () {
    const { token, admin, minter, otherAccount } = await connection.networkHelpers.loadFixture(
      deployPlasticoTokenFixture,
    );

    await token.connect(minter).mint(otherAccount.address, 100n, 1n);

    await expect(token.connect(otherAccount).pause()).to.be.revertedWithCustomError(
      token,
      "AccessControlUnauthorizedAccount",
    );

    await token.connect(admin).pause();
    await expect(
      token.connect(otherAccount).transfer(admin.address, 10n),
    ).to.be.revertedWithCustomError(token, "EnforcedPause");

    await token.connect(admin).unpause();
    await expect(token.connect(otherAccount).transfer(admin.address, 10n)).not.to.revert(ethers);
  });

  it("solo DEFAULT_ADMIN_ROLE puede autorizar una actualizacion (upgrade) del proxy", async function () {
    const { token, otherAccount } = await connection.networkHelpers.loadFixture(
      deployPlasticoTokenFixture,
    );

    const PlasticoTokenV2 = await ethers.getContractFactory(
      "PlasticoToken",
      otherAccount,
    );

    await expect(
      upgradesApi.upgradeProxy(await token.getAddress(), PlasticoTokenV2),
    ).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
  });
});
