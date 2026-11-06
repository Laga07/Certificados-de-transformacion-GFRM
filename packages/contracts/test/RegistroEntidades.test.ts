import { expect } from "chai";
import hre, { network } from "hardhat";
import { upgrades } from "@openzeppelin/hardhat-upgrades";
import { keccak256, toUtf8Bytes } from "ethers";

const connection = await network.create();
const { ethers } = connection;
const upgradesApi = await upgrades(hre, connection);

const PROVINCIA_SAN_JOSE = 0;
const PROVINCIA_LIMON = 6;

function hashOf(value: string) {
  return keccak256(toUtf8Bytes(value));
}

async function deployRegistroFixture() {
  const [admin, separador, intermediario, transformador, comprador, otraCuenta] =
    await ethers.getSigners();

  const RegistroEntidades = await ethers.getContractFactory("RegistroEntidades");
  const registro = await upgradesApi.deployProxy(RegistroEntidades, [admin.address]);
  await registro.waitForDeployment();

  const VERIFIER_ROLE = await registro.VERIFIER_ROLE();
  const DEFAULT_ADMIN_ROLE = await registro.DEFAULT_ADMIN_ROLE();

  return {
    registro,
    admin,
    separador,
    intermediario,
    transformador,
    comprador,
    otraCuenta,
    VERIFIER_ROLE,
    DEFAULT_ADMIN_ROLE,
  };
}

describe("RegistroEntidades", function () {
  it("registra un separador y evita duplicar la misma identidad", async function () {
    const { registro, separador, otraCuenta } = await connection.networkHelpers.loadFixture(
      deployRegistroFixture,
    );

    const identidadHash = hashOf("cedula-separador-1");

    await expect(
      registro.connect(separador).registrarSeparador(identidadHash, PROVINCIA_SAN_JOSE, 1, 0),
    )
      .to.emit(registro, "SeparadorRegistrado")
      .withArgs(separador.address, identidadHash, 0);

    expect(await registro.esSeparador(separador.address)).to.equal(true);

    await expect(
      registro.connect(otraCuenta).registrarSeparador(identidadHash, PROVINCIA_LIMON, 2, 1),
    ).to.be.revertedWith("Identidad ya registrada");

    await expect(
      registro.connect(separador).registrarSeparador(hashOf("otra-cedula"), PROVINCIA_SAN_JOSE, 1, 0),
    ).to.be.revertedWith("La wallet ya tiene un rol asignado");
  });

  it("rechaza un provinciaId fuera de rango", async function () {
    const { registro, separador } = await connection.networkHelpers.loadFixture(deployRegistroFixture);

    await expect(
      registro.connect(separador).registrarSeparador(hashOf("cedula-x"), 7, 1, 0),
    ).to.be.revertedWith("Provincia invalida");
  });

  it("un intermediario no queda verificado hasta que VERIFIER_ROLE lo confirme", async function () {
    const { registro, intermediario } = await connection.networkHelpers.loadFixture(
      deployRegistroFixture,
    );

    await registro
      .connect(intermediario)
      .registrarIntermediario(hashOf("nombre-centro"), hashOf("cedula-centro"), PROVINCIA_SAN_JOSE, 1, 1);

    expect(await registro.esIntermediarioVerificado(intermediario.address)).to.equal(false);

    await expect(
      registro.connect(intermediario).verificarIntermediario(intermediario.address),
    ).to.be.revertedWithCustomError(registro, "AccessControlUnauthorizedAccount"); // no tiene VERIFIER_ROLE

    const admin = (await ethers.getSigners())[0];
    await expect(registro.connect(admin).verificarIntermediario(intermediario.address))
      .to.emit(registro, "IntermediarioVerificado")
      .withArgs(intermediario.address, admin.address);

    expect(await registro.esIntermediarioVerificado(intermediario.address)).to.equal(true);

    await expect(
      registro.connect(admin).verificarIntermediario(intermediario.address),
    ).to.be.revertedWith("Ya verificado");
  });

  it("un transformador tampoco queda verificado hasta que VERIFIER_ROLE lo confirme", async function () {
    const { registro, transformador, admin } = await connection.networkHelpers.loadFixture(
      deployRegistroFixture,
    );

    await registro
      .connect(transformador)
      .registrarTransformador(hashOf("nombre-transformador"), hashOf("cedula-transformador"), PROVINCIA_SAN_JOSE, 1);

    expect(await registro.esTransformadorVerificado(transformador.address)).to.equal(false);

    await registro.connect(admin).verificarTransformador(transformador.address);

    expect(await registro.esTransformadorVerificado(transformador.address)).to.equal(true);
  });

  it("un comprador se auto-registra sin verificacion", async function () {
    const { registro, comprador } = await connection.networkHelpers.loadFixture(deployRegistroFixture);

    await expect(
      registro.connect(comprador).registrarComprador(hashOf("nombre-empresa"), hashOf("cedula-empresa"), true),
    )
      .to.emit(registro, "CompradorRegistrado")
      .withArgs(comprador.address, hashOf("nombre-empresa"), true);

    expect(await registro.esComprador(comprador.address)).to.equal(true);
  });

  it("una wallet no puede tener mas de un rol, en ninguna combinacion", async function () {
    const { registro, separador } = await connection.networkHelpers.loadFixture(deployRegistroFixture);

    await registro.connect(separador).registrarSeparador(hashOf("cedula-1"), PROVINCIA_SAN_JOSE, 1, 0);

    await expect(
      registro
        .connect(separador)
        .registrarIntermediario(hashOf("nombre-x"), hashOf("cedula-2"), PROVINCIA_SAN_JOSE, 1, 0),
    ).to.be.revertedWith("La wallet ya tiene un rol asignado");

    await expect(
      registro.connect(separador).registrarTransformador(hashOf("nombre-y"), hashOf("cedula-3"), PROVINCIA_SAN_JOSE, 1),
    ).to.be.revertedWith("La wallet ya tiene un rol asignado");

    await expect(
      registro.connect(separador).registrarComprador(hashOf("nombre-z"), hashOf("cedula-4"), false),
    ).to.be.revertedWith("La wallet ya tiene un rol asignado");
  });

  it("rolDe devuelve el rol correcto para cada tipo de cuenta", async function () {
    const { registro, separador, intermediario, transformador, comprador, otraCuenta } =
      await connection.networkHelpers.loadFixture(deployRegistroFixture);

    await registro.connect(separador).registrarSeparador(hashOf("c1"), PROVINCIA_SAN_JOSE, 1, 0);
    await registro
      .connect(intermediario)
      .registrarIntermediario(hashOf("n1"), hashOf("c2"), PROVINCIA_SAN_JOSE, 1, 0);
    await registro.connect(transformador).registrarTransformador(hashOf("n2"), hashOf("c3"), PROVINCIA_SAN_JOSE, 1);
    await registro.connect(comprador).registrarComprador(hashOf("n3"), hashOf("c4"), false);

    expect(await registro.rolDe(separador.address)).to.equal(1n); // Rol.Separador
    expect(await registro.rolDe(intermediario.address)).to.equal(2n); // Rol.Intermediario
    expect(await registro.rolDe(transformador.address)).to.equal(3n); // Rol.Transformador
    expect(await registro.rolDe(comprador.address)).to.equal(4n); // Rol.Comprador
    expect(await registro.rolDe(otraCuenta.address)).to.equal(0n); // Rol.Ninguno
  });
});
