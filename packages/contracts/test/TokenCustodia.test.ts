import { expect } from "chai";
import hre, { network } from "hardhat";
import { upgrades } from "@openzeppelin/hardhat-upgrades";
import { keccak256, toUtf8Bytes } from "ethers";

const connection = await network.create();
const { ethers } = connection;
const upgradesApi = await upgrades(hre, connection);

function hashOf(value: string) {
  return keccak256(toUtf8Bytes(value));
}

const MATERIAL_PLASTICO = 0;
const MATERIAL_CARTON = 1;
const VARIANTE_PET = 1;
const MODALIDAD_SIN_PAGO = 0;
const QUIEN_ABSORBE_ENVIA = 0;
const QUIEN_ABSORBE_RECIBE = 1;
const QUIEN_ABSORBE_MITAD = 2;

async function deployFixture() {
  const [admin, separador, intermediarioA, intermediarioB, transformador, otraCuenta] =
    await ethers.getSigners();

  const RegistroEntidades = await ethers.getContractFactory("RegistroEntidades");
  const registro = await upgradesApi.deployProxy(RegistroEntidades, [admin.address]);
  await registro.waitForDeployment();

  const TokenCustodia = await ethers.getContractFactory("TokenCustodia");
  const custodia = await upgradesApi.deployProxy(TokenCustodia, [admin.address, await registro.getAddress()]);
  await custodia.waitForDeployment();

  await registro.connect(separador).registrarSeparador(hashOf("sep-1"), 0, 1, 0);
  await registro.connect(intermediarioA).registrarIntermediario(hashOf("int-a"), hashOf("cedula-a"), 0, 1, 1);
  await registro.connect(intermediarioB).registrarIntermediario(hashOf("int-b"), hashOf("cedula-b"), 0, 1, 1);
  await registro.connect(transformador).registrarTransformador(hashOf("transf"), hashOf("cedula-transf"), 0, 1);
  await registro.connect(admin).verificarIntermediario(intermediarioA.address);
  await registro.connect(admin).verificarIntermediario(intermediarioB.address);
  await registro.connect(admin).verificarTransformador(transformador.address);

  return { registro, custodia, admin, separador, intermediarioA, intermediarioB, transformador, otraCuenta };
}

describe("TokenCustodia", function () {
  it("registra una entrega y crea un lote nuevo con el aporte del separador", async function () {
    const { custodia, separador, intermediarioA } = await connection.networkHelpers.loadFixture(deployFixture);

    const tx = custodia
      .connect(intermediarioA)
      .registrarEntrega(separador.address, MATERIAL_PLASTICO, VARIANTE_PET, 1000n, 0n, MODALIDAD_SIN_PAGO, 0n);

    await expect(tx).to.emit(custodia, "LoteCreado").withArgs(1n, MATERIAL_PLASTICO, VARIANTE_PET, intermediarioA.address);
    await expect(tx)
      .to.emit(custodia, "EntregaRegistrada")
      .withArgs(1n, separador.address, intermediarioA.address, MATERIAL_PLASTICO, VARIANTE_PET, 1000n, MODALIDAD_SIN_PAGO, 0n);

    const info = await custodia.loteInfo(1n);
    expect(info.pesoActual).to.equal(1000n);
    expect(info.pesoAceptadoOrigen).to.equal(1000n);
    expect(info.custodioActual).to.equal(intermediarioA.address);
    expect(await custodia.balanceOf(intermediarioA.address, 1n)).to.equal(1000n);

    const [separadores, kg] = await custodia.aportesDeLote(1n);
    expect(separadores).to.deep.equal([separador.address]);
    expect(kg[0]).to.equal(1000n);
  });

  it("acumula varias entregas en el mismo lote existente", async function () {
    const { custodia, registro, admin, separador, intermediarioA } =
      await connection.networkHelpers.loadFixture(deployFixture);

    const [, , , , , , otroSeparadorSigner] = await ethers.getSigners();
    await registro.connect(otroSeparadorSigner).registrarSeparador(hashOf("sep-2"), 0, 1, 1);

    await custodia
      .connect(intermediarioA)
      .registrarEntrega(separador.address, MATERIAL_PLASTICO, VARIANTE_PET, 600n, 0n, MODALIDAD_SIN_PAGO, 0n);
    await custodia
      .connect(intermediarioA)
      .registrarEntrega(otroSeparadorSigner.address, MATERIAL_PLASTICO, VARIANTE_PET, 400n, 1n, MODALIDAD_SIN_PAGO, 0n);

    const info = await custodia.loteInfo(1n);
    expect(info.pesoActual).to.equal(1000n);

    const [separadores, kg] = await custodia.aportesDeLote(1n);
    expect(separadores.length).to.equal(2);
    expect(kg.reduce((a: bigint, b: bigint) => a + b, 0n)).to.equal(1000n);
  });

  it("rechaza una entrega a un lote con material o variante distintos", async function () {
    const { custodia, separador, intermediarioA } = await connection.networkHelpers.loadFixture(deployFixture);

    await custodia
      .connect(intermediarioA)
      .registrarEntrega(separador.address, MATERIAL_PLASTICO, VARIANTE_PET, 500n, 0n, MODALIDAD_SIN_PAGO, 0n);

    await expect(
      custodia
        .connect(intermediarioA)
        .registrarEntrega(separador.address, MATERIAL_CARTON, VARIANTE_PET, 100n, 1n, MODALIDAD_SIN_PAGO, 0n),
    ).to.be.revertedWith("Material no coincide con el lote");
  });

  it("solo un intermediario verificado puede registrar entregas", async function () {
    const { custodia, separador, otraCuenta } = await connection.networkHelpers.loadFixture(deployFixture);

    await expect(
      custodia
        .connect(otraCuenta)
        .registrarEntrega(separador.address, MATERIAL_PLASTICO, VARIANTE_PET, 500n, 0n, MODALIDAD_SIN_PAGO, 0n),
    ).to.be.revertedWith("Receptor no es intermediario ni transformador verificado");
  });

  describe("traspaso en dos pasos", function () {
    async function conLoteFixture() {
      const base = await deployFixture();
      await base.custodia
        .connect(base.intermediarioA)
        .registrarEntrega(base.separador.address, MATERIAL_PLASTICO, VARIANTE_PET, 1000n, 0n, MODALIDAD_SIN_PAGO, 0n);
      return base;
    }

    it("mueve el lote completo sin merma cuando el peso recibido iguala al enviado", async function () {
      const { custodia, intermediarioA, intermediarioB } =
        await connection.networkHelpers.loadFixture(conLoteFixture);

      await custodia.connect(intermediarioA).declararEnvio(1n, intermediarioB.address, 1000n, 0n);
      await expect(custodia.connect(intermediarioB).confirmarRecepcion(1n, 1000n, QUIEN_ABSORBE_ENVIA))
        .to.emit(custodia, "RecepcionConfirmada")
        .withArgs(1n, intermediarioA.address, intermediarioB.address, 1000n, 0n, QUIEN_ABSORBE_ENVIA);

      expect(await custodia.balanceOf(intermediarioA.address, 1n)).to.equal(0n);
      expect(await custodia.balanceOf(intermediarioB.address, 1n)).to.equal(1000n);

      const info = await custodia.loteInfo(1n);
      expect(info.custodioActual).to.equal(intermediarioB.address);
      expect(info.pesoActual).to.equal(1000n);
      expect(info.pesoAceptadoOrigen).to.equal(1000n); // nunca se reduce por merma
    });

    it("atribuye la merma a quien la absorbe segun QuienAbsorbe", async function () {
      const { custodia, intermediarioA, intermediarioB } =
        await connection.networkHelpers.loadFixture(conLoteFixture);

      await custodia.connect(intermediarioA).declararEnvio(1n, intermediarioB.address, 1000n, 0n);
      await custodia.connect(intermediarioB).confirmarRecepcion(1n, 900n, QUIEN_ABSORBE_ENVIA); // 100 de merma

      const [lista, gramos] = await custodia.mermaDeLote(1n);
      const idxA = lista.indexOf(intermediarioA.address);
      const idxB = lista.indexOf(intermediarioB.address);
      expect(gramos[idxA]).to.equal(100n);
      expect(gramos[idxB]).to.equal(0n); // igual aparece en la lista (participante), sin merma
    });

    it("con QuienAbsorbe.Mitad reparte la merma entre ambas partes", async function () {
      const { custodia, intermediarioA, intermediarioB } =
        await connection.networkHelpers.loadFixture(conLoteFixture);

      await custodia.connect(intermediarioA).declararEnvio(1n, intermediarioB.address, 1000n, 0n);
      await custodia.connect(intermediarioB).confirmarRecepcion(1n, 900n, QUIEN_ABSORBE_MITAD); // 100 de merma

      const [lista, gramos] = await custodia.mermaDeLote(1n);
      const idxA = lista.indexOf(intermediarioA.address);
      const idxB = lista.indexOf(intermediarioB.address);
      expect(gramos[idxA]).to.equal(50n);
      expect(gramos[idxB]).to.equal(50n);
    });

    it("requiere enviar el lote completo (no permite un envio parcial sin dividir antes)", async function () {
      const { custodia, intermediarioA, intermediarioB } =
        await connection.networkHelpers.loadFixture(conLoteFixture);

      await expect(
        custodia.connect(intermediarioA).declararEnvio(1n, intermediarioB.address, 500n, 0n),
      ).to.be.revertedWith("Debe enviarse el peso completo del lote (dividir primero)");
    });

    it("solo el destinatario declarado puede confirmar la recepcion", async function () {
      const { custodia, intermediarioA, intermediarioB, otraCuenta } =
        await connection.networkHelpers.loadFixture(conLoteFixture);

      await custodia.connect(intermediarioA).declararEnvio(1n, intermediarioB.address, 1000n, 0n);

      await expect(
        custodia.connect(otraCuenta).confirmarRecepcion(1n, 1000n, QUIEN_ABSORBE_ENVIA),
      ).to.be.revertedWith("No sos el destinatario declarado");
    });

    it("bloquea la transferencia ERC1155 estandar -- la custodia solo se mueve via declararEnvio/confirmarRecepcion", async function () {
      const { custodia, intermediarioA, intermediarioB } =
        await connection.networkHelpers.loadFixture(conLoteFixture);

      await expect(
        custodia
          .connect(intermediarioA)
          .safeTransferFrom(intermediarioA.address, intermediarioB.address, 1n, 1000n, "0x"),
      ).to.be.revertedWith("Custodia no se transfiere libremente -- usar declararEnvio/confirmarRecepcion");
    });
  });

  describe("union y division de lotes", function () {
    it("unirLotes fusiona peso, pesoAceptadoOrigen y aportes de los lotes de origen", async function () {
      const { custodia, registro, admin, separador, intermediarioA } =
        await connection.networkHelpers.loadFixture(deployFixture);

      const [, , , , , , otroSeparadorSigner] = await ethers.getSigners();
      await registro.connect(otroSeparadorSigner).registrarSeparador(hashOf("sep-2"), 0, 1, 1);

      await custodia
        .connect(intermediarioA)
        .registrarEntrega(separador.address, MATERIAL_PLASTICO, VARIANTE_PET, 600n, 0n, MODALIDAD_SIN_PAGO, 0n);
      await custodia
        .connect(intermediarioA)
        .registrarEntrega(otroSeparadorSigner.address, MATERIAL_PLASTICO, VARIANTE_PET, 400n, 0n, MODALIDAD_SIN_PAGO, 0n);

      await expect(custodia.connect(intermediarioA).unirLotes([1n, 2n], VARIANTE_PET))
        .to.emit(custodia, "LoteUnido")
        .withArgs(3n, [1n, 2n], [600n, 400n], VARIANTE_PET);

      const info = await custodia.loteInfo(3n);
      expect(info.pesoActual).to.equal(1000n);
      expect(info.pesoAceptadoOrigen).to.equal(1000n);

      const [separadores, kg] = await custodia.aportesDeLote(3n);
      expect(separadores.length).to.equal(2);
      expect(kg.reduce((a: bigint, b: bigint) => a + b, 0n)).to.equal(1000n);

      const infoOrigen1 = await custodia.loteInfo(1n);
      expect(infoOrigen1.activo).to.equal(false);
    });

    it("rechaza unir lotes de materiales distintos", async function () {
      const { custodia, separador, intermediarioA } = await connection.networkHelpers.loadFixture(deployFixture);

      await custodia
        .connect(intermediarioA)
        .registrarEntrega(separador.address, MATERIAL_PLASTICO, VARIANTE_PET, 500n, 0n, MODALIDAD_SIN_PAGO, 0n);
      await custodia
        .connect(intermediarioA)
        .registrarEntrega(separador.address, MATERIAL_CARTON, 0, 500n, 0n, MODALIDAD_SIN_PAGO, 0n);

      await expect(custodia.connect(intermediarioA).unirLotes([1n, 2n], 0)).to.be.revertedWith(
        "Todos los lotes deben ser del mismo material",
      );
    });

    it("dividirLote reparte peso, pesoAceptadoOrigen y aportes proporcionalmente, sin perder nada por redondeo", async function () {
      const { custodia, registro, admin, separador, intermediarioA } =
        await connection.networkHelpers.loadFixture(deployFixture);

      const [, , , , , , otroSeparadorSigner] = await ethers.getSigners();
      await registro.connect(otroSeparadorSigner).registrarSeparador(hashOf("sep-2"), 0, 1, 1);

      // 333 + 667 = 1000, para forzar division no exacta (division entera con residuo)
      await custodia
        .connect(intermediarioA)
        .registrarEntrega(separador.address, MATERIAL_PLASTICO, VARIANTE_PET, 333n, 0n, MODALIDAD_SIN_PAGO, 0n);
      await custodia
        .connect(intermediarioA)
        .registrarEntrega(otroSeparadorSigner.address, MATERIAL_PLASTICO, VARIANTE_PET, 667n, 1n, MODALIDAD_SIN_PAGO, 0n);

      const piezas = await custodia.connect(intermediarioA).dividirLote.staticCall(1n, [300n, 700n]);
      await custodia.connect(intermediarioA).dividirLote(1n, [300n, 700n]);

      const infoA = await custodia.loteInfo(piezas[0]);
      const infoB = await custodia.loteInfo(piezas[1]);
      expect(infoA.pesoActual).to.equal(300n);
      expect(infoB.pesoActual).to.equal(700n);
      // La suma de pesoAceptadoOrigen de las piezas debe cerrar exacto contra el original,
      // pese al redondeo de la division entera en la primera pieza.
      expect(infoA.pesoAceptadoOrigen + infoB.pesoAceptadoOrigen).to.equal(1000n);

      const [sepsA, kgA] = await custodia.aportesDeLote(piezas[0]);
      const [sepsB, kgB] = await custodia.aportesDeLote(piezas[1]);
      const totalA = kgA.reduce((a: bigint, b: bigint) => a + b, 0n);
      const totalB = kgB.reduce((a: bigint, b: bigint) => a + b, 0n);
      expect(totalA + totalB).to.equal(1000n);
      expect(sepsA.length).to.be.greaterThan(0);
      expect(sepsB.length).to.be.greaterThan(0);
    });

    it("rechaza dividir si la suma de las piezas no iguala el peso del lote", async function () {
      const { custodia, separador, intermediarioA } = await connection.networkHelpers.loadFixture(deployFixture);

      await custodia
        .connect(intermediarioA)
        .registrarEntrega(separador.address, MATERIAL_PLASTICO, VARIANTE_PET, 1000n, 0n, MODALIDAD_SIN_PAGO, 0n);

      await expect(
        custodia.connect(intermediarioA).dividirLote(1n, [300n, 600n]),
      ).to.be.revertedWith("La suma de las piezas debe igualar el peso del lote");
    });
  });

  describe("consumirParaTransformacion", function () {
    it("solo lo puede llamar una cuenta con MERCADO_ROLE", async function () {
      const { custodia, separador, intermediarioA, transformador } =
        await connection.networkHelpers.loadFixture(deployFixture);

      await custodia
        .connect(intermediarioA)
        .registrarEntrega(separador.address, MATERIAL_PLASTICO, VARIANTE_PET, 1000n, 0n, MODALIDAD_SIN_PAGO, 0n);
      await custodia.connect(intermediarioA).declararEnvio(1n, transformador.address, 1000n, 0n);
      await custodia.connect(transformador).confirmarRecepcion(1n, 1000n, QUIEN_ABSORBE_ENVIA);

      await expect(
        custodia.connect(transformador).consumirParaTransformacion([1n], transformador.address),
      ).to.be.revertedWithCustomError(custodia, "AccessControlUnauthorizedAccount");
    });
  });
});
