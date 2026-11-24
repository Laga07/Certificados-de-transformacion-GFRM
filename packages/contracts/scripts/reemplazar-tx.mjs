// Reemplaza una transaccion del deployer que quedo trabada porque la red subio de precio
// despues de enviarla (paso dos veces en el upgrade de TokenCustodia del 2026-11-24: ofrecia
// 37 gwei de maximo y el base fee de Amoy salto a ~60). Reenvia EXACTAMENTE la misma
// operacion (mismo nonce, destino, datos y valor) con una comision mas alta: la red descarta
// la vieja y mina esta. Si era el despliegue de una implementacion, el contrato queda en la
// misma direccion y se actualiza el hash en el manifiesto de OpenZeppelin para que
// scripts/upgrade.ts lo reconozca al volver a correrlo.
//
// Uso (desde packages/contracts):
//   TX=0x<hash trabado> node scripts/reemplazar-tx.mjs
//   TX=0x... PROPINA_GWEI=60 MAXFEE_GWEI=300 node scripts/reemplazar-tx.mjs
import "dotenv/config";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { ethers } from "ethers";

const hash = process.env.TX;
if (!hash) throw new Error("Falta TX=0x<hash de la transaccion trabada>");
const propina = ethers.parseUnits(process.env.PROPINA_GWEI ?? "45", "gwei");
const maxFee = ethers.parseUnits(process.env.MAXFEE_GWEI ?? "200", "gwei");

const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL, 80002, { staticNetwork: true });
const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

const orig = await provider.getTransaction(hash);
if (!orig) throw new Error("La red no conoce esa transaccion (ya se descarto?)");
if (orig.blockNumber) {
  console.log(`Ya esta confirmada en el bloque ${orig.blockNumber}: nada que reemplazar.`);
  process.exit(0);
}
if (orig.from.toLowerCase() !== wallet.address.toLowerCase()) throw new Error("No es una transaccion del deployer");

console.log(`Reemplazando nonce ${orig.nonce} (maxFee original ${ethers.formatUnits(orig.maxFeePerGas ?? orig.gasPrice, "gwei")} gwei)`);
const tx = await wallet.sendTransaction({
  nonce: orig.nonce,
  to: orig.to,
  data: orig.data,
  value: orig.value,
  gasLimit: orig.gasLimit,
  maxPriorityFeePerGas: propina,
  maxFeePerGas: maxFee,
  type: 2,
});
console.log(`Enviada ${tx.hash}, esperando confirmacion...`);
const r = await tx.wait(1, 300_000);
console.log(`Confirmada: status ${r.status}, bloque ${r.blockNumber}${r.contractAddress ? `, contrato ${r.contractAddress}` : ""}`);

const manifiesto = "./.openzeppelin/unknown-80002.json";
if (existsSync(manifiesto)) {
  const m = JSON.parse(readFileSync(manifiesto, "utf8"));
  let cambios = 0;
  for (const v of Object.values(m.impls ?? {})) {
    if (v.txHash === hash) {
      v.txHash = tx.hash;
      cambios++;
    }
  }
  if (cambios) {
    writeFileSync(manifiesto, JSON.stringify(m, null, 2) + "\n");
    console.log("Manifiesto de OpenZeppelin actualizado: volver a correr scripts/upgrade.ts para terminar.");
  }
}
