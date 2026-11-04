import { expect } from "chai";
import { network } from "hardhat";

const connection = await network.create();
const { ethers } = connection;

async function deployMockUSDTFixture() {
  const [owner, otherAccount] = await ethers.getSigners();

  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy(owner.address);
  await usdt.waitForDeployment();

  return { usdt, owner, otherAccount };
}

describe("MockUSDT", function () {
  it("usa 6 decimales, como el USDT real", async function () {
    const { usdt } = await connection.networkHelpers.loadFixture(deployMockUSDTFixture);

    expect(await usdt.decimals()).to.equal(6);
    expect(await usdt.name()).to.equal("Mock Tether USD");
    expect(await usdt.symbol()).to.equal("USDT");
  });

  it("permite a cualquier cuenta pedir tokens de prueba via faucet hasta el limite", async function () {
    const { usdt, otherAccount } = await connection.networkHelpers.loadFixture(
      deployMockUSDTFixture,
    );

    const amount = 5_000n * 10n ** 6n;
    await usdt.connect(otherAccount).faucet(amount);

    expect(await usdt.balanceOf(otherAccount.address)).to.equal(amount);
  });

  it("revierte el faucet si se excede el limite por llamada", async function () {
    const { usdt, otherAccount } = await connection.networkHelpers.loadFixture(
      deployMockUSDTFixture,
    );

    const limit = await usdt.FAUCET_LIMIT();

    await expect(usdt.connect(otherAccount).faucet(limit + 1n)).to.be.revertedWith(
      "Excede el limite del faucet",
    );
  });

  it("permite mint solo al owner", async function () {
    const { usdt, owner, otherAccount } = await connection.networkHelpers.loadFixture(
      deployMockUSDTFixture,
    );

    await usdt.connect(owner).mint(otherAccount.address, 1_000_000n);
    expect(await usdt.balanceOf(otherAccount.address)).to.equal(1_000_000n);

    await expect(
      usdt.connect(otherAccount).mint(otherAccount.address, 1n),
    ).to.be.revertedWithCustomError(usdt, "OwnableUnauthorizedAccount");
  });
});
