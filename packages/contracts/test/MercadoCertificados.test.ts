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
const VARIANTE_PET = 1;
const MODALIDAD_SIN_PAGO = 0;
const QUIEN_ABSORBE_ENVIA = 0;

async function deployFixture() {
  const [admin, plataforma, separador, acopio, compactador, transformador, comprador, otraCuenta] =
    await ethers.getSigners();

  const RegistroEntidades = await ethers.getContractFactory("RegistroEntidades");
  const registro = await upgradesApi.deployProxy(RegistroEntidades, [admin.address]);
  await registro.waitForDeployment();

  const TokenCustodia = await ethers.getContractFactory("TokenCustodia");
  const custodia = await upgradesApi.deployProxy(TokenCustodia, [admin.address, await registro.getAddress()]);
  await custodia.waitForDeployment();

  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy(admin.address);
  await usdt.waitForDeployment();

  const CertificadoTransformacion = await ethers.getContractFactory("CertificadoTransformacion");
  const certImpl = await CertificadoTransformacion.deploy();
  await certImpl.waitForDeployment();

  const MercadoCertificados = await ethers.getContractFactory("MercadoCertificados");
  const mercado = await upgradesApi.deployProxy(MercadoCertificados, [
    admin.address,
    await registro.getAddress(),
    await custodia.getAddress(),
    await usdt.getAddress(),
    await certImpl.getAddress(),
    plataforma.address,
  ]);
  await mercado.waitForDeployment();

  const MERCADO_ROLE = await custodia.MERCADO_ROLE();
  await custodia.connect(admin).grantRole(MERCADO_ROLE, await mercado.getAddress());

  await mercado.connect(admin).desplegarCertificado(MATERIAL_PLASTICO, "Certificado Plastico", "CERT-PLAST");
  const certAddress = await mercado.certificados(MATERIAL_PLASTICO);
  const certificado = await ethers.getContractAt("CertificadoTransformacion", certAddress);

  await registro.connect(separador).registrarSeparador(hashOf("sep-1"), 0, 1, 0);
  await registro.connect(acopio).registrarIntermediario(hashOf("acopio"), hashOf("cedula-acopio"), 0, 1, 1);
  await registro.connect(compactador).registrarIntermediario(hashOf("compact"), hashOf("cedula-compact"), 0, 1, 2);
  await registro.connect(transformador).registrarTransformador(hashOf("transf"), hashOf("cedula-transf"), 0, 1);
  await registro.connect(comprador).registrarComprador(hashOf("comprador"), hashOf("cedula-comprador"), true);
  await registro.connect(admin).verificarIntermediario(acopio.address);
  await registro.connect(admin).verificarIntermediario(compactador.address);
  await registro.connect(admin).verificarTransformador(transformador.address);

  return {
    registro,
    custodia,
    usdt,
    certificado,
    mercado,
    admin,
    plataforma,
    separador,
    acopio,
    compactador,
    transformador,
    comprador,
    otraCuenta,
  };
}

/** Reproduce la cadena del ejemplo ilustrativo del documento (Tabla 12):
 * separador -> acopio (sin merma) -> compactador (2% merma, 200kg) -> transformador
 * (3% merma, 294kg) -> 9,506 kg transformados. */
async function cadenaTabla12Fixture() {
  const base = await deployFixture();
  const { custodia, separador, acopio, compactador, transformador } = base;

  await custodia
    .connect(acopio)
    .registrarEntrega(separador.address, MATERIAL_PLASTICO, VARIANTE_PET, 10_000n, 0n, MODALIDAD_SIN_PAGO, 0n);

  await custodia.connect(acopio).declararEnvio(1n, compactador.address, 10_000n, 0n);
  await custodia.connect(compactador).confirmarRecepcion(1n, 10_000n, QUIEN_ABSORBE_ENVIA); // sin merma en acopio

  await custodia.connect(compactador).declararEnvio(1n, transformador.address, 10_000n, 0n);
  await custodia.connect(transformador).confirmarRecepcion(1n, 9_800n, QUIEN_ABSORBE_ENVIA); // 200kg merma -> compactador

  return base;
}

describe("MercadoCertificados", function () {
  it("registrarTransformacion crea una emision con el peso y la merma del transformador correctos", async function () {
    const { mercado, transformador } = await connection.networkHelpers.loadFixture(cadenaTabla12Fixture);

    await expect(mercado.connect(transformador).registrarTransformacion([1n], 9_506n, 1n))
      .to.emit(mercado, "TransformacionRegistrada")
      .withArgs(1n, transformador.address, MATERIAL_PLASTICO, [1n], 2n, 9_800n, 9_506n, 294n, 1n);

    const emision = await mercado.emisiones(1n);
    expect(emision.kgTransformadosOriginal).to.equal(9_506n);
    expect(emision.kgDisponiblesPrimario).to.equal(9_506n);
    expect(emision.pesoAceptadoOrigenTotal).to.equal(10_000n);
  });

  it("solo un transformador verificado puede registrar una transformacion", async function () {
    const { mercado, compactador } = await connection.networkHelpers.loadFixture(cadenaTabla12Fixture);

    await expect(mercado.connect(compactador).registrarTransformacion([1n], 9_506n, 1n)).to.be.revertedWith(
      "No es transformador verificado",
    );
  });

  describe("venta primaria -- reproduce el ejemplo de la Tabla 12 del documento", function () {
    async function emisionFixture() {
      const base = await connection.networkHelpers.loadFixture(cadenaTabla12Fixture);
      await base.mercado.connect(base.transformador).registrarTransformacion([1n], 9_506n, 1n);
      await base.usdt.connect(base.admin).mint(base.comprador.address, 1_000_000_000n);
      await base.usdt.connect(base.comprador).approve(await base.mercado.getAddress(), 1_000_000_000n);
      return base;
    }

    it("reparte exactamente 3500/1000/800/2706/1500 al comprar todo el lote de una vez", async function () {
      const { mercado, usdt, plataforma, separador, acopio, compactador, transformador, comprador } =
        await connection.networkHelpers.loadFixture(emisionFixture);

      await mercado.connect(comprador).comprarCertificado(1n, 9_506n);

      expect(await mercado.saldoPendiente(separador.address)).to.equal(3500n);
      expect(await mercado.saldoPendiente(acopio.address)).to.equal(1000n);
      expect(await mercado.saldoPendiente(compactador.address)).to.equal(800n);
      expect(await mercado.saldoPendiente(transformador.address)).to.equal(2706n);
      expect(await mercado.saldoPendiente(plataforma.address)).to.equal(1500n);

      const suma =
        (await mercado.saldoPendiente(separador.address)) +
        (await mercado.saldoPendiente(acopio.address)) +
        (await mercado.saldoPendiente(compactador.address)) +
        (await mercado.saldoPendiente(transformador.address)) +
        (await mercado.saldoPendiente(plataforma.address));
      expect(suma).to.equal(9506n);

      expect(await usdt.balanceOf(await mercado.getAddress())).to.equal(9506n);
    });

    it("una venta parcial (50%) escala cada parte proporcionalmente, con la misma suma total", async function () {
      const { mercado, separador, acopio, compactador, transformador, plataforma, comprador } =
        await connection.networkHelpers.loadFixture(emisionFixture);

      // La mitad de 9506 no es exacta (9506/2 = 4753) -- usamos esa cantidad real.
      await mercado.connect(comprador).comprarCertificado(1n, 4_753n);

      const saldoSeparador = await mercado.saldoPendiente(separador.address);
      const saldoAcopio = await mercado.saldoPendiente(acopio.address);
      const saldoCompactador = await mercado.saldoPendiente(compactador.address);
      const saldoTransformador = await mercado.saldoPendiente(transformador.address);
      const saldoPlataforma = await mercado.saldoPendiente(plataforma.address);

      const suma = saldoSeparador + saldoAcopio + saldoCompactador + saldoTransformador + saldoPlataforma;
      expect(suma).to.equal(4753n); // == cantidadKg * precio (1), sin dejar ni de mas ni de menos

      // Aproximadamente la mitad de cada parte de la venta completa (3500/1000/800/2706/1500)
      expect(saldoSeparador).to.be.closeTo(1750n, 2n);
      expect(saldoTransformador).to.be.closeTo(1353n, 2n);
    });

    it("mintea el certificado al comprador y descuenta kgDisponiblesPrimario", async function () {
      const { mercado, certificado, comprador } = await connection.networkHelpers.loadFixture(emisionFixture);

      await mercado.connect(comprador).comprarCertificado(1n, 9_506n);

      expect(await certificado.balanceOf(comprador.address)).to.equal(9_506n * 10n ** 18n);
      const emision = await mercado.emisiones(1n);
      expect(emision.kgDisponiblesPrimario).to.equal(0n);
    });

    it("rechaza comprar mas de lo disponible", async function () {
      const { mercado, comprador } = await connection.networkHelpers.loadFixture(emisionFixture);

      await expect(mercado.connect(comprador).comprarCertificado(1n, 9_507n)).to.be.revertedWith(
        "Cantidad invalida",
      );
    });

    it("solo un comprador registrado puede comprar", async function () {
      const { mercado, otraCuenta } = await connection.networkHelpers.loadFixture(emisionFixture);

      await expect(mercado.connect(otraCuenta).comprarCertificado(1n, 100n)).to.be.revertedWith(
        "No es comprador registrado",
      );
    });
  });

  describe("cascada de merma -- piso en cero y faltante", function () {
    it("un unico eslabon en falta: el faltante se reparte entre separadores y los demas eslabones (no el que genero la merma)", async function () {
      // El compactador pierde 1500 de 10,000 (15%, bastante mas de lo normal). Su base como
      // intermediario (10% x 10,000 = 1000) no alcanza a cubrir esa perdida -> queda en cero
      // y el faltante (500) se reparte entre separadores + acopio + transformador (los que
      // no generaron la merma).
      const base = await deployFixture();
      const { custodia, mercado, usdt, admin, separador, acopio, compactador, transformador, comprador } = base;

      await custodia
        .connect(acopio)
        .registrarEntrega(separador.address, MATERIAL_PLASTICO, VARIANTE_PET, 10_000n, 0n, MODALIDAD_SIN_PAGO, 0n);
      await custodia.connect(acopio).declararEnvio(1n, compactador.address, 10_000n, 0n);
      await custodia.connect(compactador).confirmarRecepcion(1n, 10_000n, QUIEN_ABSORBE_ENVIA);
      await custodia.connect(compactador).declararEnvio(1n, transformador.address, 10_000n, 0n);
      await custodia.connect(transformador).confirmarRecepcion(1n, 8_500n, QUIEN_ABSORBE_ENVIA); // 1500 de merma, todo compactador

      await mercado.connect(transformador).registrarTransformacion([1n], 8_500n, 1n); // sin merma de transformacion aparte

      await usdt.connect(admin).mint(comprador.address, 1_000_000n);
      await usdt.connect(comprador).approve(await mercado.getAddress(), 1_000_000n);
      await mercado.connect(comprador).comprarCertificado(1n, 8_500n);

      expect(await mercado.saldoPendiente(compactador.address)).to.equal(0n);
      // acopio y transformador no generaron merma, pero igual ceden una parte de su base
      // (166 cada uno, piso floor(500/3)) para ayudar a cubrir el faltante.
      expect(await mercado.saldoPendiente(acopio.address)).to.equal(834n); // 1000 - 166
      expect(await mercado.saldoPendiente(transformador.address)).to.equal(2834n); // 3000 - 166

      const suma =
        (await mercado.saldoPendiente(separador.address)) +
        (await mercado.saldoPendiente(acopio.address)) +
        (await mercado.saldoPendiente(compactador.address)) +
        (await mercado.saldoPendiente(transformador.address)) +
        (await mercado.saldoPendiente(base.plataforma.address));
      expect(suma).to.equal(8500n); // cantidadKg(8500) * precio(1), balance exacto
    });

    it("dos o mas eslabones en falta: el faltante combinado se cubre desde los separadores", async function () {
      // El compactador pierde 1300 (supera su base de 1000 por 300) y el transformador
      // transforma muy poco de lo que recibe, perdiendo 4700 (supera su base de 3000 por
      // 1700). Separadores si tiene margen de sobra (su base es 3500) para cubrir el
      // faltante combinado de 2000 sin quedar en negativo.
      const base = await deployFixture();
      const { custodia, mercado, usdt, admin, separador, acopio, compactador, transformador, comprador, plataforma } =
        base;

      await custodia
        .connect(acopio)
        .registrarEntrega(separador.address, MATERIAL_PLASTICO, VARIANTE_PET, 10_000n, 0n, MODALIDAD_SIN_PAGO, 0n);
      await custodia.connect(acopio).declararEnvio(1n, compactador.address, 10_000n, 0n);
      await custodia.connect(compactador).confirmarRecepcion(1n, 10_000n, QUIEN_ABSORBE_ENVIA);
      await custodia.connect(compactador).declararEnvio(1n, transformador.address, 10_000n, 0n);
      await custodia.connect(transformador).confirmarRecepcion(1n, 8_700n, QUIEN_ABSORBE_ENVIA); // 1300 merma compactador

      await mercado.connect(transformador).registrarTransformacion([1n], 4_000n, 1n); // 4700 de merma del transformador

      await usdt.connect(admin).mint(comprador.address, 1_000_000n);
      await usdt.connect(comprador).approve(await mercado.getAddress(), 1_000_000n);
      await mercado.connect(comprador).comprarCertificado(1n, 4_000n);

      expect(await mercado.saldoPendiente(compactador.address)).to.equal(0n);
      expect(await mercado.saldoPendiente(transformador.address)).to.equal(0n);
      // El acopio no genero merma y no es el eslabon en falta -> cobra su base completa (10% x 10,000 = 1000)
      expect(await mercado.saldoPendiente(acopio.address)).to.equal(1000n);
      // Separadores absorbe el faltante combinado (2000) de su base (3500): 3500-2000=1500
      expect(await mercado.saldoPendiente(separador.address)).to.equal(1500n);

      const suma =
        (await mercado.saldoPendiente(separador.address)) +
        (await mercado.saldoPendiente(acopio.address)) +
        (await mercado.saldoPendiente(compactador.address)) +
        (await mercado.saldoPendiente(transformador.address)) +
        (await mercado.saldoPendiente(plataforma.address));
      expect(suma).to.equal(4000n); // balance exacto, nunca mas de lo cobrado
    });

    it("sin intermediarios (el transformador recibe la entrega directo del separador), el 20% pasa a la plataforma", async function () {
      const { custodia, mercado, usdt, admin, separador, transformador, comprador, plataforma } =
        await connection.networkHelpers.loadFixture(deployFixture);

      // registrarEntrega tambien acepta a un Transformador verificado como receptor (Tabla
      // 11: "si el material llega directo al transformador") -- aca no hay ningun
      // Intermediario en la cadena en absoluto.
      await custodia
        .connect(transformador)
        .registrarEntrega(separador.address, MATERIAL_PLASTICO, VARIANTE_PET, 1_000n, 0n, MODALIDAD_SIN_PAGO, 0n);

      await mercado.connect(transformador).registrarTransformacion([1n], 1_000n, 1n);

      await usdt.connect(admin).mint(comprador.address, 1_000_000n);
      await usdt.connect(comprador).approve(await mercado.getAddress(), 1_000_000n);
      await mercado.connect(comprador).comprarCertificado(1n, 1_000n);

      // 35% separador + 30% transformador + (15% + 20% que no tenia a quien asignarle) plataforma
      expect(await mercado.saldoPendiente(separador.address)).to.equal(350n);
      expect(await mercado.saldoPendiente(transformador.address)).to.equal(300n);
      expect(await mercado.saldoPendiente(plataforma.address)).to.equal(350n); // 150 + 200

      const suma =
        (await mercado.saldoPendiente(separador.address)) +
        (await mercado.saldoPendiente(transformador.address)) +
        (await mercado.saldoPendiente(plataforma.address));
      expect(suma).to.equal(1000n);
    });

    it("con un solo intermediario en la cadena, a ese intermediario le toca el 20% completo", async function () {
      const { custodia, mercado, usdt, admin, separador, acopio, transformador, comprador } =
        await connection.networkHelpers.loadFixture(deployFixture);

      await custodia
        .connect(acopio)
        .registrarEntrega(separador.address, MATERIAL_PLASTICO, VARIANTE_PET, 1_000n, 0n, MODALIDAD_SIN_PAGO, 0n);
      await custodia.connect(acopio).declararEnvio(1n, transformador.address, 1_000n, 0n);
      await custodia.connect(transformador).confirmarRecepcion(1n, 1_000n, QUIEN_ABSORBE_ENVIA);

      await mercado.connect(transformador).registrarTransformacion([1n], 1_000n, 1n);

      await usdt.connect(admin).mint(comprador.address, 1_000_000n);
      await usdt.connect(comprador).approve(await mercado.getAddress(), 1_000_000n);
      await mercado.connect(comprador).comprarCertificado(1n, 1_000n);

      expect(await mercado.saldoPendiente(acopio.address)).to.equal(200n); // 20% completo, un solo intermediario
    });
  });

  describe("retiro de pagos y certificados", function () {
    it("retirarPago es permissionless y transfiere el saldo completo", async function () {
      const { mercado, usdt, separador, acopio, compactador, transformador, comprador, otraCuenta, admin } =
        await connection.networkHelpers.loadFixture(cadenaTabla12Fixture);

      await mercado.connect(transformador).registrarTransformacion([1n], 9_506n, 1n);
      await usdt.connect(admin).mint(comprador.address, 1_000_000_000n);
      await usdt.connect(comprador).approve(await mercado.getAddress(), 1_000_000_000n);
      await mercado.connect(comprador).comprarCertificado(1n, 9_506n);

      const saldoAntes = await mercado.saldoPendiente(separador.address);
      expect(saldoAntes).to.be.greaterThan(0n);

      // Cualquiera puede llamar retirarPago -- lo dispara otraCuenta, el dinero llega igual
      // a `separador`, no a quien llama.
      await expect(mercado.connect(otraCuenta).retirarPago(separador.address))
        .to.emit(mercado, "PagoRetirado")
        .withArgs(separador.address, saldoAntes);

      expect(await mercado.saldoPendiente(separador.address)).to.equal(0n);
      expect(await usdt.balanceOf(separador.address)).to.equal(saldoAntes);

      await expect(mercado.connect(otraCuenta).retirarPago(separador.address)).to.be.revertedWith(
        "Sin saldo pendiente",
      );
    });

    it("retirarCertificado quema el saldo del comprador y emite el evento con la referencia del informe", async function () {
      const { mercado, certificado, usdt, admin, transformador, comprador } =
        await connection.networkHelpers.loadFixture(cadenaTabla12Fixture);

      await mercado.connect(transformador).registrarTransformacion([1n], 9_506n, 1n);
      await usdt.connect(admin).mint(comprador.address, 1_000_000_000n);
      await usdt.connect(comprador).approve(await mercado.getAddress(), 1_000_000_000n);
      await mercado.connect(comprador).comprarCertificado(1n, 9_506n);

      const informeRef = hashOf("informe-ley-9786-2026-Q4");
      await expect(mercado.connect(comprador).retirarCertificado(MATERIAL_PLASTICO, 9_506n, informeRef, 4))
        .to.emit(mercado, "CertificadoRetirado")
        .withArgs(comprador.address, MATERIAL_PLASTICO, 9_506n, informeRef, 4);

      expect(await certificado.balanceOf(comprador.address)).to.equal(0n);
    });
  });
});
