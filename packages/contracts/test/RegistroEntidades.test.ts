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
  const [admin, usuario, centro, otraCuenta] = await ethers.getSigners();

  const RegistroEntidades = await ethers.getContractFactory("RegistroEntidades");
  const registro = await upgradesApi.deployProxy(RegistroEntidades, [admin.address]);
  await registro.waitForDeployment();

  const VERIFIER_ROLE = await registro.VERIFIER_ROLE();
  const MUNICIPALIDAD_ROLE = await registro.MUNICIPALIDAD_ROLE();
  const DEFAULT_ADMIN_ROLE = await registro.DEFAULT_ADMIN_ROLE();

  return {
    registro,
    admin,
    usuario,
    centro,
    otraCuenta,
    VERIFIER_ROLE,
    MUNICIPALIDAD_ROLE,
    DEFAULT_ADMIN_ROLE,
  };
}

describe("RegistroEntidades", function () {
  it("registra un usuario y evita duplicar la misma identidadHash", async function () {
    const { registro, usuario, otraCuenta } = await connection.networkHelpers.loadFixture(
      deployRegistroFixture,
    );

    const identidadHash = hashOf("cedula-usuario-1");

    await expect(
      registro.connect(usuario).registrarUsuario(identidadHash, PROVINCIA_SAN_JOSE, 1, 250, 0),
    )
      .to.emit(registro, "UsuarioRegistrado")
      .withArgs(usuario.address, identidadHash);

    expect(await registro.esUsuario(usuario.address)).to.equal(true);

    // La misma cedula no puede registrarse dos veces, ni siquiera desde otra wallet
    await expect(
      registro
        .connect(otraCuenta)
        .registrarUsuario(identidadHash, PROVINCIA_LIMON, 2, 0, 1),
    ).to.be.revertedWith("Cedula ya registrada");

    // La misma wallet no puede registrarse dos veces
    await expect(
      registro
        .connect(usuario)
        .registrarUsuario(hashOf("otra-cedula"), PROVINCIA_SAN_JOSE, 1, 0, 0),
    ).to.be.revertedWith("La wallet ya tiene un rol asignado");
  });

  it("rechaza un provinciaId fuera de rango", async function () {
    const { registro, usuario } = await connection.networkHelpers.loadFixture(
      deployRegistroFixture,
    );

    await expect(
      registro.connect(usuario).registrarUsuario(hashOf("cedula-x"), 7, 1, 0, 0),
    ).to.be.revertedWith("Provincia invalida");
  });

  it("registra un centro recolector y requiere verificarCentro (solo VERIFIER_ROLE) antes de operar", async function () {
    const { registro, admin, centro, otraCuenta } = await connection.networkHelpers.loadFixture(
      deployRegistroFixture,
    );

    const nombreHash = hashOf("Centro Verde");
    const cedulaHash = hashOf("cedula-juridica-1");

    await registro
      .connect(centro)
      .registrarCentroRecolector(nombreHash, cedulaHash, PROVINCIA_SAN_JOSE, 3, 500, 2, true);

    expect(await registro.esCentroVerificado(centro.address)).to.equal(false);

    await expect(
      registro.connect(otraCuenta).verificarCentro(centro.address),
    ).to.be.revertedWithCustomError(registro, "AccessControlUnauthorizedAccount");

    await expect(registro.connect(admin).verificarCentro(centro.address))
      .to.emit(registro, "CentroVerificado")
      .withArgs(centro.address, admin.address);

    expect(await registro.esCentroVerificado(centro.address)).to.equal(true);

    await expect(registro.connect(admin).verificarCentro(centro.address)).to.be.revertedWith(
      "Centro ya verificado",
    );
  });

  it("solo el admin (DEFAULT_ADMIN_ROLE) puede registrar una municipalidad, y le otorga MUNICIPALIDAD_ROLE", async function () {
    const { registro, admin, otraCuenta, MUNICIPALIDAD_ROLE } =
      await connection.networkHelpers.loadFixture(deployRegistroFixture);

    const nombreHash = hashOf("Municipalidad de San Jose");

    await expect(
      registro
        .connect(otraCuenta)
        .registrarMunicipalidad(otraCuenta.address, nombreHash, PROVINCIA_SAN_JOSE, 1),
    ).to.be.revertedWithCustomError(registro, "AccessControlUnauthorizedAccount");

    await expect(
      registro
        .connect(admin)
        .registrarMunicipalidad(otraCuenta.address, nombreHash, PROVINCIA_SAN_JOSE, 1),
    )
      .to.emit(registro, "MunicipalidadRegistrada")
      .withArgs(otraCuenta.address, nombreHash);

    expect(await registro.esMunicipalidad(otraCuenta.address)).to.equal(true);
    expect(await registro.hasRole(MUNICIPALIDAD_ROLE, otraCuenta.address)).to.equal(true);

    const municipalidad = await registro.municipalidades(otraCuenta.address);
    expect(municipalidad.provincia).to.equal(BigInt(PROVINCIA_SAN_JOSE));
    expect(municipalidad.cantonId).to.equal(1);
  });

  it("rechaza un provinciaId fuera de rango al registrar una municipalidad", async function () {
    const { registro, admin, otraCuenta } = await connection.networkHelpers.loadFixture(
      deployRegistroFixture,
    );

    await expect(
      registro.connect(admin).registrarMunicipalidad(otraCuenta.address, hashOf("Muni X"), 7, 1),
    ).to.be.revertedWith("Provincia invalida");
  });

  describe("exclusividad de roles (una wallet = un solo rol)", function () {
    it("una wallet ya registrada como usuario no puede registrarse como centro", async function () {
      const { registro, usuario } = await connection.networkHelpers.loadFixture(
        deployRegistroFixture,
      );

      await registro
        .connect(usuario)
        .registrarUsuario(hashOf("cedula-usuario-1"), PROVINCIA_SAN_JOSE, 1, 0, 0);

      await expect(
        registro
          .connect(usuario)
          .registrarCentroRecolector(
            hashOf("Centro X"),
            hashOf("cedula-juridica-x"),
            PROVINCIA_SAN_JOSE,
            1,
            0,
            2,
            false,
          ),
      ).to.be.revertedWith("La wallet ya tiene un rol asignado");
    });

    it("una wallet ya registrada como centro no puede registrarse como usuario", async function () {
      const { registro, centro } = await connection.networkHelpers.loadFixture(
        deployRegistroFixture,
      );

      await registro
        .connect(centro)
        .registrarCentroRecolector(
          hashOf("Centro Y"),
          hashOf("cedula-juridica-y"),
          PROVINCIA_SAN_JOSE,
          1,
          0,
          2,
          false,
        );

      await expect(
        registro.connect(centro).registrarUsuario(hashOf("cedula-y"), PROVINCIA_SAN_JOSE, 1, 0, 0),
      ).to.be.revertedWith("La wallet ya tiene un rol asignado");
    });

    it("el admin no puede registrar como municipalidad una wallet que ya es usuario o centro", async function () {
      const { registro, admin, usuario, centro } = await connection.networkHelpers.loadFixture(
        deployRegistroFixture,
      );

      await registro
        .connect(usuario)
        .registrarUsuario(hashOf("cedula-usuario-2"), PROVINCIA_SAN_JOSE, 1, 0, 0);
      await registro
        .connect(centro)
        .registrarCentroRecolector(
          hashOf("Centro Z"),
          hashOf("cedula-juridica-z"),
          PROVINCIA_SAN_JOSE,
          1,
          0,
          2,
          false,
        );

      await expect(
        registro
          .connect(admin)
          .registrarMunicipalidad(usuario.address, hashOf("Muni Usuario"), PROVINCIA_SAN_JOSE, 1),
      ).to.be.revertedWith("La wallet ya tiene un rol asignado");

      await expect(
        registro
          .connect(admin)
          .registrarMunicipalidad(centro.address, hashOf("Muni Centro"), PROVINCIA_SAN_JOSE, 1),
      ).to.be.revertedWith("La wallet ya tiene un rol asignado");
    });

    it("una wallet ya registrada como municipalidad no puede registrarse como usuario ni centro", async function () {
      const { registro, admin, otraCuenta } = await connection.networkHelpers.loadFixture(
        deployRegistroFixture,
      );

      await registro
        .connect(admin)
        .registrarMunicipalidad(otraCuenta.address, hashOf("Muni W"), PROVINCIA_SAN_JOSE, 1);

      await expect(
        registro
          .connect(otraCuenta)
          .registrarUsuario(hashOf("cedula-w"), PROVINCIA_SAN_JOSE, 1, 0, 0),
      ).to.be.revertedWith("La wallet ya tiene un rol asignado");

      await expect(
        registro
          .connect(otraCuenta)
          .registrarCentroRecolector(
            hashOf("Centro W"),
            hashOf("cedula-juridica-w"),
            PROVINCIA_SAN_JOSE,
            1,
            0,
            2,
            false,
          ),
      ).to.be.revertedWith("La wallet ya tiene un rol asignado");
    });
  });
});
