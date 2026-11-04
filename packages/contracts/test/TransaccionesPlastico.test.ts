import { expect } from "chai";
import hre, { network } from "hardhat";
import { upgrades } from "@openzeppelin/hardhat-upgrades";
import { keccak256, toUtf8Bytes } from "ethers";

const connection = await network.create();
const { ethers } = connection;
const upgradesApi = await upgrades(hre, connection);

const TOKENS_POR_GRAMO = 10n ** 18n;
const USDT_DECIMALS = 10n ** 6n;

// TipoTransaccion
const TX_USUARIO_A_CENTRO_GRATIS = 0;
const TX_USUARIO_A_CENTRO_USUARIO_RECIBE = 1;
const TX_USUARIO_A_MUNICIPALIDAD = 3;

// TipoPlastico
const PET = 1;
const PEAD = 2;

function hashOf(value: string) {
  return keccak256(toUtf8Bytes(value));
}

async function deploySistemaFixture() {
  const [admin, usuario1, usuario2, centro, municipalidad, otraCuenta] =
    await ethers.getSigners();

  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy(admin.address);
  await usdt.waitForDeployment();

  const RegistroEntidades = await ethers.getContractFactory("RegistroEntidades");
  const registro = await upgradesApi.deployProxy(RegistroEntidades, [admin.address]);
  await registro.waitForDeployment();

  const PlasticoToken = await ethers.getContractFactory("PlasticoToken");
  const token = await upgradesApi.deployProxy(PlasticoToken, [
    "Plastico Token",
    "PLST",
    admin.address,
  ]);
  await token.waitForDeployment();

  const TransaccionesPlastico = await ethers.getContractFactory("TransaccionesPlastico");
  const transacciones = await upgradesApi.deployProxy(TransaccionesPlastico, [
    admin.address,
    await token.getAddress(),
    await registro.getAddress(),
    await usdt.getAddress(),
  ]);
  await transacciones.waitForDeployment();

  // Paso critico: sin esto TransaccionesPlastico no puede mintear tokens
  const MINTER_ROLE = await token.MINTER_ROLE();
  await token.connect(admin).grantRole(MINTER_ROLE, await transacciones.getAddress());

  // Registrar usuario1 y usuario2
  await registro
    .connect(usuario1)
    .registrarUsuario(hashOf("cedula-usuario1"), 0, 1, 100, 0);
  await registro
    .connect(usuario2)
    .registrarUsuario(hashOf("cedula-usuario2"), 0, 1, 100, 0);

  // Registrar y verificar el centro
  await registro
    .connect(centro)
    .registrarCentroRecolector(hashOf("Centro Verde"), hashOf("cedula-centro"), 0, 1, 300, 2, true);
  await registro.connect(admin).verificarCentro(centro.address);

  // Registrar la municipalidad
  await registro.connect(admin).registrarMunicipalidad(municipalidad.address, hashOf("Muni SJ"), 0, 1);

  return {
    usdt,
    registro,
    token,
    transacciones,
    admin,
    usuario1,
    usuario2,
    centro,
    municipalidad,
    otraCuenta,
  };
}

describe("TransaccionesPlastico", function () {
  describe("registrarTransaccionGratuita", function () {
    it("un centro verificado recibe plastico de un usuario y mintea tokens", async function () {
      const { transacciones, token, usuario1, centro } =
        await connection.networkHelpers.loadFixture(deploySistemaFixture);

      const pesoGramos = 500n;
      const tokensEsperados = pesoGramos * TOKENS_POR_GRAMO;

      await expect(
        transacciones
          .connect(centro)
          .registrarTransaccionGratuita(usuario1.address, pesoGramos, TX_USUARIO_A_CENTRO_GRATIS, PET),
      )
        .to.emit(transacciones, "TransaccionRegistrada")
        .withArgs(1n, usuario1.address, centro.address, pesoGramos, 0n, TX_USUARIO_A_CENTRO_GRATIS, PET);

      expect(await token.balanceOf(centro.address)).to.equal(tokensEsperados);
    });

    it("una municipalidad recibe plastico de un usuario y mintea tokens", async function () {
      const { transacciones, token, usuario1, municipalidad } =
        await connection.networkHelpers.loadFixture(deploySistemaFixture);

      const pesoGramos = 750n;

      await transacciones
        .connect(municipalidad)
        .registrarTransaccionGratuita(usuario1.address, pesoGramos, TX_USUARIO_A_MUNICIPALIDAD, PET);

      expect(await token.balanceOf(municipalidad.address)).to.equal(pesoGramos * TOKENS_POR_GRAMO);
    });

    it("revierte si el origen no es un usuario registrado", async function () {
      const { transacciones, centro, otraCuenta } = await connection.networkHelpers.loadFixture(
        deploySistemaFixture,
      );

      await expect(
        transacciones
          .connect(centro)
          .registrarTransaccionGratuita(otraCuenta.address, 100n, TX_USUARIO_A_CENTRO_GRATIS, PET),
      ).to.be.revertedWith("Origen no es usuario registrado");
    });

    it("revierte si el llamador no es un centro verificado ni una municipalidad", async function () {
      const { transacciones, usuario1, otraCuenta } = await connection.networkHelpers.loadFixture(
        deploySistemaFixture,
      );

      await expect(
        transacciones
          .connect(otraCuenta)
          .registrarTransaccionGratuita(usuario1.address, 100n, TX_USUARIO_A_CENTRO_GRATIS, PET),
      ).to.be.revertedWith("Llamador no es centro verificado");
    });

    it("revierte con un tipo de transaccion invalido para el flujo gratuito", async function () {
      const { transacciones, usuario1, centro } = await connection.networkHelpers.loadFixture(
        deploySistemaFixture,
      );

      await expect(
        transacciones
          .connect(centro)
          .registrarTransaccionGratuita(
            usuario1.address,
            100n,
            TX_USUARIO_A_CENTRO_USUARIO_RECIBE,
            PET,
          ),
      ).to.be.revertedWith("Tipo de transaccion invalido");
    });

    it("revierte si el llamador intenta auto-entregarse material (usuario == msg.sender)", async function () {
      const { transacciones, centro } = await connection.networkHelpers.loadFixture(
        deploySistemaFixture,
      );

      // El guard corre antes de validar roles: alcanza con que usuario == msg.sender.
      await expect(
        transacciones
          .connect(centro)
          .registrarTransaccionGratuita(centro.address, 100n, TX_USUARIO_A_CENTRO_GRATIS, PET),
      ).to.be.revertedWith("Un usuario no puede auto-entregarse material");
    });
  });

  describe("registrarTransaccionPagada", function () {
    async function fondearUsuarioConUSDT(usdt: any, admin: any, usuario: any, cantidad: bigint) {
      await usdt.connect(admin).mint(usuario.address, cantidad);
    }

    it("el usuario paga USDT al centro por un servicio (usuarioPaga = true)", async function () {
      const { transacciones, usdt, token, usuario1, centro, admin } =
        await connection.networkHelpers.loadFixture(deploySistemaFixture);

      const montoUSDT = 10n * USDT_DECIMALS;
      await fondearUsuarioConUSDT(usdt, admin, usuario1, montoUSDT);
      await usdt.connect(usuario1).approve(await transacciones.getAddress(), montoUSDT);

      const pesoGramos = 200n;
      await transacciones
        .connect(usuario1)
        .registrarTransaccionPagada(centro.address, pesoGramos, montoUSDT, true, PET);

      expect(await usdt.balanceOf(centro.address)).to.equal(montoUSDT);
      expect(await usdt.balanceOf(usuario1.address)).to.equal(0n);
      // En este sub-flujo el "destino" (quien recibe tokens PLST) es el centro
      expect(await token.balanceOf(centro.address)).to.equal(pesoGramos * TOKENS_POR_GRAMO);
    });

    it("el centro paga USDT al usuario por el plastico (usuarioPaga = false)", async function () {
      const { transacciones, usdt, token, usuario1, centro, admin } =
        await connection.networkHelpers.loadFixture(deploySistemaFixture);

      const montoUSDT = 15n * USDT_DECIMALS;
      await usdt.connect(admin).mint(centro.address, montoUSDT);
      await usdt.connect(centro).approve(await transacciones.getAddress(), montoUSDT);

      const pesoGramos = 300n;
      await transacciones
        .connect(centro)
        .registrarTransaccionPagada(usuario1.address, pesoGramos, montoUSDT, false, PET);

      expect(await usdt.balanceOf(usuario1.address)).to.equal(montoUSDT);
      // En este sub-flujo el "destino" (quien recibe tokens PLST) es el centro, que asume el gas
      expect(await token.balanceOf(centro.address)).to.equal(pesoGramos * TOKENS_POR_GRAMO);
    });

    it("revierte si no hay allowance suficiente de USDT", async function () {
      const { transacciones, usdt, usuario1, centro, admin } =
        await connection.networkHelpers.loadFixture(deploySistemaFixture);

      await usdt.connect(admin).mint(usuario1.address, 10n * USDT_DECIMALS);
      // Sin approve

      await expect(
        transacciones
          .connect(usuario1)
          .registrarTransaccionPagada(centro.address, 100n, 10n * USDT_DECIMALS, true, PET),
      ).to.revert(ethers);
    });

    it("revierte si la contraparte es el propio llamador", async function () {
      const { transacciones, usuario1 } = await connection.networkHelpers.loadFixture(
        deploySistemaFixture,
      );

      await expect(
        transacciones
          .connect(usuario1)
          .registrarTransaccionPagada(usuario1.address, 100n, 10n * USDT_DECIMALS, true, PET),
      ).to.be.revertedWith("Un usuario no puede transar consigo mismo");
    });
  });

  describe("Ciclo de lote municipal", function () {
    it("cierra un lote vacio sin entregas con factorAjuste = 10000 (100%)", async function () {
      const { transacciones, municipalidad } = await connection.networkHelpers.loadFixture(
        deploySistemaFixture,
      );

      await transacciones.connect(municipalidad).iniciarLoteMunicipal(1_700_000_000n, 1);

      await expect(transacciones.connect(municipalidad).cerrarLotePorTipo(1n, PET, 0n))
        .to.emit(transacciones, "LoteMunicipalCerrado")
        .withArgs(1n, 0n, 10000n);
    });

    it("reconcilia hacia abajo: quema el excedente de tokens de la municipalidad (o lo maximo disponible)", async function () {
      const { transacciones, token, usuario1, usuario2, municipalidad } =
        await connection.networkHelpers.loadFixture(deploySistemaFixture);

      await transacciones.connect(municipalidad).iniciarLoteMunicipal(1_700_000_000n, 1);

      await transacciones
        .connect(municipalidad)
        .registrarEntregaMunicipal(1n, usuario1.address, 1000n, PET, 1);
      await transacciones
        .connect(municipalidad)
        .registrarEntregaMunicipal(1n, usuario2.address, 2000n, PET, 1);

      // sumaPesosUsuarios = 3000g -> sumaTokensMinteados = 3000e18
      expect(await token.balanceOf(municipalidad.address)).to.equal(3000n * TOKENS_POR_GRAMO);

      // La municipalidad transfiere la mayoria de sus tokens antes de cerrar el lote,
      // dejando balance insuficiente para la quema completa (caso de "quema parcial").
      await token.connect(municipalidad).transfer(usuario1.address, 2500n * TOKENS_POR_GRAMO);
      expect(await token.balanceOf(municipalidad.address)).to.equal(500n * TOKENS_POR_GRAMO);

      // El peso oficial (1000g) es menor al declarado por los usuarios (3000g)
      const pesoOficialGramos = 1000n;
      const factorAjusteEsperado = (pesoOficialGramos * 10000n) / 3000n; // 3333 (basis points)

      await expect(
        transacciones.connect(municipalidad).cerrarLotePorTipo(1n, PET, pesoOficialGramos),
      )
        .to.emit(transacciones, "LoteTipoCerrado")
        .withArgs(1n, PET, pesoOficialGramos, factorAjusteEsperado)
        .and.to.emit(transacciones, "LoteMunicipalCerrado")
        .withArgs(1n, pesoOficialGramos, 10000n); // factor "combinado" fijo -- ver comentario en el evento

      // Solo se pudo quemar lo que quedaba en el balance (500e18), no toda la diferencia
      expect(await token.balanceOf(municipalidad.address)).to.equal(0n);

      const tx1 = await transacciones.transacciones(1n);
      expect(tx1.reconciliada).to.equal(true);
      expect(tx1.pesoGramos).to.equal((1000n * factorAjusteEsperado) / 10000n);
    });

    it("reconcilia hacia arriba: mintea la diferencia si el peso oficial supera lo minteado", async function () {
      const { transacciones, token, usuario1, municipalidad } =
        await connection.networkHelpers.loadFixture(deploySistemaFixture);

      await transacciones.connect(municipalidad).iniciarLoteMunicipal(1_700_000_000n, 1);
      await transacciones
        .connect(municipalidad)
        .registrarEntregaMunicipal(1n, usuario1.address, 1000n, PET, 1);

      expect(await token.balanceOf(municipalidad.address)).to.equal(1000n * TOKENS_POR_GRAMO);

      // El peso oficial (2000g) es mayor al declarado por el usuario (1000g)
      await transacciones.connect(municipalidad).cerrarLotePorTipo(1n, PET, 2000n);

      // factorAjuste = (2000*10000)/1000 = 20000 (200%)
      expect(await token.balanceOf(municipalidad.address)).to.equal(2000n * TOKENS_POR_GRAMO);
    });

    it("revierte registrarEntregaMunicipal si el rutaId no coincide con el del lote", async function () {
      const { transacciones, usuario1, municipalidad } = await connection.networkHelpers.loadFixture(
        deploySistemaFixture,
      );

      await transacciones.connect(municipalidad).iniciarLoteMunicipal(1_700_000_000n, 1);

      await expect(
        transacciones
          .connect(municipalidad)
          .registrarEntregaMunicipal(1n, usuario1.address, 500n, PET, 2),
      ).to.be.revertedWith("Ruta no coincide con el lote");
    });

    it("revierte si se intenta operar sobre un lote ya cerrado", async function () {
      const { transacciones, usuario1, municipalidad } = await connection.networkHelpers.loadFixture(
        deploySistemaFixture,
      );

      await transacciones.connect(municipalidad).iniciarLoteMunicipal(1_700_000_000n, 1);
      await transacciones.connect(municipalidad).cerrarLotePorTipo(1n, PET, 0n);

      await expect(
        transacciones
          .connect(municipalidad)
          .registrarEntregaMunicipal(1n, usuario1.address, 500n, PET, 1),
      ).to.be.revertedWith("Lote ya cerrado");

      await expect(
        transacciones.connect(municipalidad).cerrarLotePorTipo(1n, PET, 0n),
      ).to.be.revertedWith("Lote ya cerrado");
    });
  });

  describe("Cierre de lote por tipo de plastico (multi-tipo)", function () {
    it("un lote con dos tipos sigue abierto hasta que se cierran los dos por separado", async function () {
      const { transacciones, token, usuario1, usuario2, municipalidad } =
        await connection.networkHelpers.loadFixture(deploySistemaFixture);

      await transacciones.connect(municipalidad).iniciarLoteMunicipal(1_700_000_000n, 1);
      await transacciones
        .connect(municipalidad)
        .registrarEntregaMunicipal(1n, usuario1.address, 1000n, PET, 1);
      await transacciones
        .connect(municipalidad)
        .registrarEntregaMunicipal(1n, usuario2.address, 500n, PEAD, 1);

      // Cerrar PET no cierra el lote: PEAD sigue pendiente.
      await expect(transacciones.connect(municipalidad).cerrarLotePorTipo(1n, PET, 1000n))
        .to.emit(transacciones, "LoteTipoCerrado")
        .withArgs(1n, PET, 1000n, 10000n)
        .and.not.to.emit(transacciones, "LoteMunicipalCerrado");

      let lote = await transacciones.lotesMunicipales(1n);
      expect(lote.cerrado).to.equal(false);

      // La transaccion de PEAD no se toco -- sigue sin reconciliar.
      const txPead = await transacciones.transacciones(2n);
      expect(txPead.reconciliada).to.equal(false);

      // Cerrar PEAD (peso oficial menor al declarado: se ajusta a la mitad) si cierra el lote.
      await expect(transacciones.connect(municipalidad).cerrarLotePorTipo(1n, PEAD, 250n))
        .to.emit(transacciones, "LoteTipoCerrado")
        .withArgs(1n, PEAD, 250n, 5000n)
        .and.to.emit(transacciones, "LoteMunicipalCerrado")
        .withArgs(1n, 1250n, 10000n); // 1000 (PET) + 250 (PEAD)

      lote = await transacciones.lotesMunicipales(1n);
      expect(lote.cerrado).to.equal(true);
      expect(lote.pesoOficialGramos).to.equal(1250n);

      const txPeadFinal = await transacciones.transacciones(2n);
      expect(txPeadFinal.reconciliada).to.equal(true);
      expect(txPeadFinal.pesoGramos).to.equal(250n);

      // Balance final de tokens: 1000 (PET, sin ajuste) + 250 (PEAD, ajustado a la mitad)
      expect(await token.balanceOf(municipalidad.address)).to.equal(1250n * TOKENS_POR_GRAMO);
    });

    it("preserva el peso declarado original y expone el resumen por tipo via resumenTipoEnLote", async function () {
      const { transacciones, usuario1, municipalidad } = await connection.networkHelpers.loadFixture(
        deploySistemaFixture,
      );

      await transacciones.connect(municipalidad).iniciarLoteMunicipal(1_700_000_000n, 1);
      await transacciones
        .connect(municipalidad)
        .registrarEntregaMunicipal(1n, usuario1.address, 1000n, PET, 1);

      // Antes de cerrar: presente, no reconciliado, declarado == actual (nada se ajusto todavia).
      let resumen = await transacciones.resumenTipoEnLote(1n, PET);
      expect(resumen.presente).to.equal(true);
      expect(resumen.reconciliado).to.equal(false);
      expect(resumen.pesoDeclaradoTotal).to.equal(1000n);
      expect(resumen.pesoActualTotal).to.equal(1000n);

      await transacciones.connect(municipalidad).cerrarLotePorTipo(1n, PET, 400n);

      // El peso "actual" (usado para tokens) se ajusta; el declarado original se mantiene.
      const tx = await transacciones.transacciones(1n);
      expect(tx.pesoGramos).to.equal(400n);
      expect(tx.pesoGramosDeclarado).to.equal(1000n);

      resumen = await transacciones.resumenTipoEnLote(1n, PET);
      expect(resumen.reconciliado).to.equal(true);
      expect(resumen.pesoDeclaradoTotal).to.equal(1000n); // el usuario declaro esto
      expect(resumen.pesoActualTotal).to.equal(400n); // la muni aprobo esto
      expect(resumen.pesoOficialGramos).to.equal(400n);
      expect(resumen.factorAjuste).to.equal(4000n); // 40%
    });

    it("revierte si se intenta cerrar el mismo tipo dos veces", async function () {
      const { transacciones, usuario1, municipalidad } = await connection.networkHelpers.loadFixture(
        deploySistemaFixture,
      );

      await transacciones.connect(municipalidad).iniciarLoteMunicipal(1_700_000_000n, 1);
      await transacciones
        .connect(municipalidad)
        .registrarEntregaMunicipal(1n, usuario1.address, 1000n, PET, 1);

      await transacciones.connect(municipalidad).cerrarLotePorTipo(1n, PET, 1000n);

      await expect(
        transacciones.connect(municipalidad).cerrarLotePorTipo(1n, PET, 1000n),
      ).to.be.revertedWith("Lote ya cerrado"); // ya era el unico tipo -> el lote entero quedo cerrado
    });

    it("revierte si se intenta cerrar un tipo ya reconciliado mientras el lote sigue abierto por otro tipo", async function () {
      const { transacciones, usuario1, usuario2, municipalidad } =
        await connection.networkHelpers.loadFixture(deploySistemaFixture);

      await transacciones.connect(municipalidad).iniciarLoteMunicipal(1_700_000_000n, 1);
      await transacciones
        .connect(municipalidad)
        .registrarEntregaMunicipal(1n, usuario1.address, 1000n, PET, 1);
      await transacciones
        .connect(municipalidad)
        .registrarEntregaMunicipal(1n, usuario2.address, 500n, PEAD, 1);

      await transacciones.connect(municipalidad).cerrarLotePorTipo(1n, PET, 1000n);

      await expect(
        transacciones.connect(municipalidad).cerrarLotePorTipo(1n, PET, 1000n),
      ).to.be.revertedWith("Ese tipo ya fue cerrado");
    });

    it("revierte una entrega nueva de un tipo que ya se cerro, aunque el lote siga abierto", async function () {
      const { transacciones, usuario1, usuario2, municipalidad } =
        await connection.networkHelpers.loadFixture(deploySistemaFixture);

      await transacciones.connect(municipalidad).iniciarLoteMunicipal(1_700_000_000n, 1);
      await transacciones
        .connect(municipalidad)
        .registrarEntregaMunicipal(1n, usuario1.address, 1000n, PET, 1);
      await transacciones
        .connect(municipalidad)
        .registrarEntregaMunicipal(1n, usuario2.address, 500n, PEAD, 1);

      await transacciones.connect(municipalidad).cerrarLotePorTipo(1n, PET, 1000n);

      await expect(
        transacciones
          .connect(municipalidad)
          .registrarEntregaMunicipal(1n, usuario1.address, 200n, PET, 1),
      ).to.be.revertedWith("Ese tipo de plastico ya se cerro en este lote");
    });

    it("permite declarar un peso oficial para un tipo sin entregas previas en el lote", async function () {
      const PVC = 3;
      const { transacciones, token, usuario1, usuario2, municipalidad } =
        await connection.networkHelpers.loadFixture(deploySistemaFixture);

      await transacciones.connect(municipalidad).iniciarLoteMunicipal(1_700_000_000n, 1);
      await transacciones
        .connect(municipalidad)
        .registrarEntregaMunicipal(1n, usuario1.address, 1000n, PET, 1);
      await transacciones
        .connect(municipalidad)
        .registrarEntregaMunicipal(1n, usuario2.address, 400n, PVC, 1);

      // Cerrar PET no cierra el lote: PVC sigue pendiente.
      await transacciones.connect(municipalidad).cerrarLotePorTipo(1n, PET, 1000n);

      // PEAD nunca tuvo una entrega en la app (ej. una entrega en papel) -- se declara
      // directo al cerrar, y se mintea el peso oficial completo sin nada que ajustar. El
      // lote sigue abierto: PVC todavia esta pendiente.
      await expect(transacciones.connect(municipalidad).cerrarLotePorTipo(1n, PEAD, 300n))
        .to.emit(transacciones, "LoteTipoCerrado")
        .withArgs(1n, PEAD, 300n, 10000n)
        .and.not.to.emit(transacciones, "LoteMunicipalCerrado");

      expect((await transacciones.lotesMunicipales(1n)).cerrado).to.equal(false);

      // Al cerrar el ultimo tipo pendiente (PVC), recien ahi se cierra el lote completo.
      await expect(transacciones.connect(municipalidad).cerrarLotePorTipo(1n, PVC, 400n))
        .to.emit(transacciones, "LoteMunicipalCerrado")
        .withArgs(1n, 1700n, 10000n); // 1000 (PET) + 300 (PEAD) + 400 (PVC)

      expect(await token.balanceOf(municipalidad.address)).to.equal(1700n * TOKENS_POR_GRAMO);
    });
  });

  describe("registrarEntregaUsuario (autoservicio)", function () {
    it("el propio usuario reporta su entrega y los tokens preliminares van a la municipalidad", async function () {
      const { transacciones, token, usuario1, municipalidad } =
        await connection.networkHelpers.loadFixture(deploySistemaFixture);

      await transacciones.connect(municipalidad).iniciarLoteMunicipal(1_700_000_000n, 1);

      await expect(
        transacciones.connect(usuario1).registrarEntregaUsuario(1n, 600n, PET, 1),
      )
        .to.emit(transacciones, "TransaccionRegistrada")
        .withArgs(1n, usuario1.address, municipalidad.address, 600n, 0n, TX_USUARIO_A_MUNICIPALIDAD, PET);

      // El token preliminar sigue yendo a la municipalidad, no al usuario que reporto
      expect(await token.balanceOf(municipalidad.address)).to.equal(600n * TOKENS_POR_GRAMO);
      expect(await token.balanceOf(usuario1.address)).to.equal(0n);
    });

    it("registrarEntregaMunicipal y registrarEntregaUsuario pueden combinarse en el mismo lote", async function () {
      const { transacciones, token, usuario1, usuario2, municipalidad } =
        await connection.networkHelpers.loadFixture(deploySistemaFixture);

      await transacciones.connect(municipalidad).iniciarLoteMunicipal(1_700_000_000n, 1);

      // usuario1 se autoregistra; la municipalidad entra la entrega de usuario2 por el
      await transacciones.connect(usuario1).registrarEntregaUsuario(1n, 1000n, PET, 1);
      await transacciones
        .connect(municipalidad)
        .registrarEntregaMunicipal(1n, usuario2.address, 2000n, PET, 1);

      expect(await token.balanceOf(municipalidad.address)).to.equal(3000n * TOKENS_POR_GRAMO);

      await transacciones.connect(municipalidad).cerrarLotePorTipo(1n, PET, 3000n);

      const tx1 = await transacciones.transacciones(1n);
      const tx2 = await transacciones.transacciones(2n);
      expect(tx1.reconciliada).to.equal(true);
      expect(tx2.reconciliada).to.equal(true);
    });

    it("revierte si el llamador no es un usuario registrado", async function () {
      const { transacciones, municipalidad, otraCuenta } =
        await connection.networkHelpers.loadFixture(deploySistemaFixture);

      await transacciones.connect(municipalidad).iniciarLoteMunicipal(1_700_000_000n, 1);

      await expect(
        transacciones.connect(otraCuenta).registrarEntregaUsuario(1n, 500n, PET, 1),
      ).to.be.revertedWith("No es usuario registrado");
    });

    it("revierte si el lote no existe", async function () {
      const { transacciones, usuario1 } = await connection.networkHelpers.loadFixture(
        deploySistemaFixture,
      );

      await expect(
        transacciones.connect(usuario1).registrarEntregaUsuario(99n, 500n, PET, 1),
      ).to.be.revertedWith("Lote no existe");
    });

    it("revierte si el rutaId no coincide o el lote ya esta cerrado", async function () {
      const { transacciones, usuario1, municipalidad } = await connection.networkHelpers.loadFixture(
        deploySistemaFixture,
      );

      await transacciones.connect(municipalidad).iniciarLoteMunicipal(1_700_000_000n, 1);

      await expect(
        transacciones.connect(usuario1).registrarEntregaUsuario(1n, 500n, PET, 2),
      ).to.be.revertedWith("Ruta no coincide con el lote");

      await transacciones.connect(municipalidad).cerrarLotePorTipo(1n, PET, 0n);

      await expect(
        transacciones.connect(usuario1).registrarEntregaUsuario(1n, 500n, PET, 1),
      ).to.be.revertedWith("Lote ya cerrado");
    });
  });

  describe("getTransaccionesPorDireccion", function () {
    it("devuelve los IDs de todas las transacciones donde la cuenta participo", async function () {
      const { transacciones, usuario1, centro, municipalidad } =
        await connection.networkHelpers.loadFixture(deploySistemaFixture);

      await transacciones
        .connect(centro)
        .registrarTransaccionGratuita(usuario1.address, 100n, TX_USUARIO_A_CENTRO_GRATIS, PET);
      await transacciones
        .connect(municipalidad)
        .registrarTransaccionGratuita(usuario1.address, 200n, TX_USUARIO_A_MUNICIPALIDAD, PET);

      const idsUsuario = await transacciones.getTransaccionesPorDireccion(usuario1.address);
      expect(idsUsuario.map((id: bigint) => id.toString())).to.deep.equal(["1", "2"]);

      const idsCentro = await transacciones.getTransaccionesPorDireccion(centro.address);
      expect(idsCentro.map((id: bigint) => id.toString())).to.deep.equal(["1"]);
    });
  });

  describe("pausa (PAUSER_ROLE)", function () {
    it("solo PAUSER_ROLE puede pausar/despausar", async function () {
      const { transacciones, otraCuenta } = await connection.networkHelpers.loadFixture(
        deploySistemaFixture,
      );

      await expect(
        transacciones.connect(otraCuenta).pause(),
      ).to.be.revertedWithCustomError(transacciones, "AccessControlUnauthorizedAccount");
    });

    it("bloquea las operaciones de escritura mientras esta pausado, y las restaura al despausar", async function () {
      const { transacciones, admin, centro, usuario1, municipalidad } =
        await connection.networkHelpers.loadFixture(deploySistemaFixture);

      await transacciones.connect(admin).pause();

      await expect(
        transacciones
          .connect(centro)
          .registrarTransaccionGratuita(usuario1.address, 100n, TX_USUARIO_A_CENTRO_GRATIS, PET),
      ).to.be.revertedWithCustomError(transacciones, "EnforcedPause");

      await expect(
        transacciones.connect(municipalidad).iniciarLoteMunicipal(1n, 1),
      ).to.be.revertedWithCustomError(transacciones, "EnforcedPause");

      await transacciones.connect(admin).unpause();

      await expect(
        transacciones
          .connect(centro)
          .registrarTransaccionGratuita(usuario1.address, 100n, TX_USUARIO_A_CENTRO_GRATIS, PET),
      ).to.emit(transacciones, "TransaccionRegistrada");
    });
  });
});
