import { expect } from "chai";
import hre, { network } from "hardhat";
import { upgrades } from "@openzeppelin/hardhat-upgrades";
import { keccak256, toUtf8Bytes } from "ethers";

// Medicion de gas en funcion de la cantidad de separadores por lote (plan de produccion, A3).
// Una ruta municipal puede juntar cientos de separadores en un mismo lote, y varias funciones
// recorren la lista completa: unir, dividir, transformar (copia la lista a la emision) y
// comprar (acredita a cada separador). Este test imprime la tabla de gas por operacion.
const connection = await network.create();
const { ethers } = connection;
const upgradesApi = await upgrades(hre, connection);

const MATERIAL_PLASTICO = 0;
const VARIANTE_PET = 1;
// Limite explicito: la estimacion automatica de Hardhat no sirve para medir operaciones que
// fallan por gas. 16,777,216 = 2^24 es el tope por transaccion de EIP-7825 (Ethereum, Fusaka);
// se usa como techo para que la medicion refleje lo que cabe en una red que lo adopte.
const TOPE_TX = 16_777_216n;
const G = { gasLimit: TOPE_TX };

function hashOf(value: string) {
  return keccak256(toUtf8Bytes(value));
}

async function desplegar() {
  const [admin, plataforma, acopio, transformador, comprador] = await ethers.getSigners();

  const registro = await upgradesApi.deployProxy(await ethers.getContractFactory("RegistroEntidades"), [admin.address]);
  const custodia = await upgradesApi.deployProxy(await ethers.getContractFactory("TokenCustodia"), [
    admin.address,
    await registro.getAddress(),
  ]);
  const usdt = await (await ethers.getContractFactory("MockUSDT")).deploy(admin.address);
  const certImpl = await (await ethers.getContractFactory("CertificadoTransformacion")).deploy();
  const mercado = await upgradesApi.deployProxy(await ethers.getContractFactory("MercadoCertificados"), [
    admin.address,
    await registro.getAddress(),
    await custodia.getAddress(),
    await usdt.getAddress(),
    await certImpl.getAddress(),
    plataforma.address,
  ]);
  await custodia.connect(admin).grantRole(await custodia.MERCADO_ROLE(), await mercado.getAddress());
  await mercado.connect(admin).desplegarCertificado(MATERIAL_PLASTICO, "Certificado Plastico", "CERT-PLAST");

  await registro.connect(acopio).registrarIntermediario(hashOf("acopio"), hashOf("c-acopio"), 0, 1, 1);
  await registro.connect(transformador).registrarTransformador(hashOf("transf"), hashOf("c-transf"), 0, 1);
  await registro.connect(comprador).registrarComprador(hashOf("comp"), hashOf("c-comp"), true);
  await registro.connect(admin).verificarIntermediario(acopio.address);
  await registro.connect(admin).verificarTransformador(transformador.address);

  return { admin, acopio, transformador, comprador, registro, custodia, mercado, usdt };
}

type Tx = { wait: () => Promise<{ gasUsed: bigint } | null> };

// Devuelve el gas usado, o null si la transaccion no entra en TOPE_TX (o revierte).
async function gas(fn: () => Promise<Tx>): Promise<bigint | null> {
  try {
    const receipt = await (await fn()).wait();
    return receipt!.gasUsed;
  } catch {
    return null;
  }
}

interface Fila {
  n: number;
  dividir: bigint | null;
  unir: bigint | null;
  transformar: bigint | null;
  comprar: bigint | null;
}

async function medir(n: number): Promise<Fila> {
  const { admin, acopio, transformador, comprador, registro, custodia, mercado, usdt } = await desplegar();

  // n separadores distintos (una wallet = un rol), cada uno entrega 1 kg.
  const separadores = [];
  for (let i = 0; i < n; i++) {
    const w = ethers.Wallet.createRandom().connect(ethers.provider);
    await admin.sendTransaction({ to: w.address, value: ethers.parseEther("1") });
    await registro.connect(w).registrarSeparador(hashOf(`sep-${n}-${i}`), 0, 1, 0);
    separadores.push(w);
  }

  // Dos lotes iguales con los n separadores: el 1 se divide, el 2 se usa para unir/transformar.
  async function loteCon(todos: typeof separadores): Promise<bigint> {
    const id = (await custodia.nextLoteId()) + 1n;
    for (let i = 0; i < todos.length; i++) {
      await custodia
        .connect(acopio)
        .registrarEntrega(todos[i].address, MATERIAL_PLASTICO, VARIANTE_PET, 1000n, i === 0 ? 0n : id, 0, 0n, G);
    }
    return id;
  }
  const loteA = await loteCon(separadores);
  const loteB = await loteCon(separadores);
  const loteChico = await loteCon([separadores[0]]);

  const pesoTotal = BigInt(n) * 1000n;
  const mitad = BigInt(Math.floor(n / 2)) * 1000n;
  const dividir = await gas(() => custodia.connect(acopio).dividirLote(loteA, [mitad, pesoTotal - mitad], G));

  const unir = await gas(() => custodia.connect(acopio).unirLotes([loteB, loteChico], VARIANTE_PET, G));
  const loteFinal = unir === null ? loteB : await custodia.nextLoteId();
  const pesoFinal = unir === null ? pesoTotal : pesoTotal + 1000n;

  await custodia.connect(acopio).declararEnvio(loteFinal, transformador.address, pesoFinal, 0n, G);
  await custodia.connect(transformador).confirmarRecepcion(loteFinal, pesoFinal, 0, G);

  const kg = pesoFinal / 1000n;
  const transformar = await gas(() =>
    mercado.connect(transformador).registrarTransformacion([loteFinal], kg, 1_000_000n, G),
  );

  let comprar: bigint | null = null;
  if (transformar !== null) {
    await usdt.connect(admin).mint(comprador.address, 10n ** 15n);
    await usdt.connect(comprador).approve(await mercado.getAddress(), 10n ** 15n);
    comprar = await gas(() => mercado.connect(comprador).comprarCertificado(1n, kg, G));
  }

  return { n, dividir, unir, transformar, comprar };
}

// Peor caso aceptado para cualquier operacion con el lote lleno: deja ~4M de margen bajo el
// tope por transaccion de EIP-7825.
const PRESUPUESTO = 12_500_000n;
const MAX = 60;

async function registrarSeparadores(
  admin: Awaited<ReturnType<typeof desplegar>>["admin"],
  registro: Awaited<ReturnType<typeof desplegar>>["registro"],
  n: number,
  prefijo: string,
) {
  const lista = [];
  for (let i = 0; i < n; i++) {
    const w = ethers.Wallet.createRandom().connect(ethers.provider);
    await admin.sendTransaction({ to: w.address, value: ethers.parseEther("1") });
    await registro.connect(w).registrarSeparador(hashOf(`${prefijo}-${i}`), 0, 1, 0);
    lista.push(w);
  }
  return lista;
}

describe("Gas por cantidad de separadores en un lote", function () {
  this.timeout(900_000);

  it(`con el lote lleno (${MAX} separadores) toda operacion entra en ${Number(PRESUPUESTO) / 1e6}M de gas`, async function () {
    const filas: Fila[] = [];
    for (const n of [10, 30, MAX]) filas.push(await medir(n));

    const fmt = (g: bigint | null) => (g === null ? " NO ENTRA" : `${(Number(g) / 1e6).toFixed(2).padStart(8)}M`);
    console.log("\n      separadores |   dividir |      unir | transformar |   comprar");
    for (const f of filas) {
      console.log(
        `      ${String(f.n).padStart(11)} | ${fmt(f.dividir)} | ${fmt(f.unir)} | ${fmt(f.transformar).padStart(11)} | ${fmt(f.comprar)}`,
      );
    }

    const lleno = filas[filas.length - 1];
    for (const [op, g] of Object.entries({ dividir: lleno.dividir, unir: lleno.unir, transformar: lleno.transformar, comprar: lleno.comprar })) {
      expect(g !== null && g < PRESUPUESTO, `${op} con ${MAX} separadores usa ${g} de gas`).to.equal(true);
    }
  });

  it(`rechaza el separador numero ${MAX + 1} en un lote`, async function () {
    const { admin, acopio, registro, custodia } = await desplegar();
    const seps = await registrarSeparadores(admin, registro, MAX + 1, "tope");
    for (let i = 0; i < MAX; i++) {
      await custodia.connect(acopio).registrarEntrega(seps[i].address, MATERIAL_PLASTICO, VARIANTE_PET, 1000n, i === 0 ? 0n : 1n, 0, 0n, G);
    }
    await expect(
      custodia.connect(acopio).registrarEntrega(seps[MAX].address, MATERIAL_PLASTICO, VARIANTE_PET, 1000n, 1n, 0, 0n, G),
    ).to.be.revertedWith("Lote con el maximo de 60 separadores: usar un lote nuevo o menos lotes a la vez");
    // Un separador que YA esta en el lote puede seguir entregando.
    await custodia.connect(acopio).registrarEntrega(seps[0].address, MATERIAL_PLASTICO, VARIANTE_PET, 500n, 1n, 0, 0n, G);
  });

  it("rechaza unir o transformar lotes cuya union supera el tope", async function () {
    const { admin, acopio, transformador, registro, custodia, mercado } = await desplegar();
    const seps = await registrarSeparadores(admin, registro, 80, "union");
    for (const [desde, lote] of [[0, 1n], [40, 2n]] as const) {
      for (let i = 0; i < 40; i++) {
        await custodia.connect(acopio).registrarEntrega(seps[desde + i].address, MATERIAL_PLASTICO, VARIANTE_PET, 1000n, i === 0 ? 0n : lote, 0, 0n, G);
      }
    }
    await expect(custodia.connect(acopio).unirLotes([1n, 2n], VARIANTE_PET, G)).to.be.revertedWith(
      "Lote con el maximo de 60 separadores: usar un lote nuevo o menos lotes a la vez",
    );

    // Transformar los dos juntos tampoco (la consolidacion suma 80); de a uno si.
    for (const lote of [1n, 2n]) {
      await custodia.connect(acopio).declararEnvio(lote, transformador.address, 40_000n, 0n, G);
      await custodia.connect(transformador).confirmarRecepcion(lote, 40_000n, 0, G);
    }
    await expect(mercado.connect(transformador).registrarTransformacion([1n, 2n], 80n, 1n, G)).to.be.revertedWith(
      "Lote con el maximo de 60 separadores: usar un lote nuevo o menos lotes a la vez",
    );
    await mercado.connect(transformador).registrarTransformacion([1n], 40n, 1n, G);
    await mercado.connect(transformador).registrarTransformacion([2n], 40n, 1n, G);
  });

  it("limita las piezas al dividir segun los separadores del lote", async function () {
    const { admin, acopio, registro, custodia } = await desplegar();
    const seps = await registrarSeparadores(admin, registro, MAX, "piezas");
    for (let i = 0; i < MAX; i++) {
      await custodia.connect(acopio).registrarEntrega(seps[i].address, MATERIAL_PLASTICO, VARIANTE_PET, 1000n, i === 0 ? 0n : 1n, 0, 0n, G);
    }
    // 60 separadores x 3 piezas = 180 > 120
    await expect(custodia.connect(acopio).dividirLote(1n, [20_000n, 20_000n, 20_000n], G)).to.be.revertedWith(
      "Demasiadas piezas para los separadores del lote (separadores x piezas <= 120)",
    );
    // 60 x 2 = 120: permitido
    await custodia.connect(acopio).dividirLote(1n, [30_000n, 30_000n], G);
  });
});
