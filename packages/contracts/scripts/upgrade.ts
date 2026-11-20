import { readFile } from "node:fs/promises";
import path from "node:path";
import hre, { network } from "hardhat";
import { upgrades } from "@openzeppelin/hardhat-upgrades";

// Sube una nueva implementacion a uno de los tres proxies UUPS ya desplegados. La direccion
// del proxy (la que usan backend y frontend) no cambia; solo la logica detras.
//
// Uso:
//   CONTRACT=MercadoCertificados npx hardhat run scripts/upgrade.ts --network amoy
//   CONTRACT=TokenCustodia       npx hardhat run scripts/upgrade.ts --network amoy
//   CONTRACT=RegistroEntidades   npx hardhat run scripts/upgrade.ts --network amoy
//
// El plugin de OpenZeppelin valida la compatibilidad del storage layout contra lo guardado
// en .openzeppelin/<red>.json (por eso ese archivo SI se trackea en git) y aborta si una
// variable nueva pisa una existente. Despues del upgrade: `npm run contracts:export` y
// `npm run frontend:generate` para refrescar ABIs y hooks; el indexer no necesita reinicio
// salvo que haya eventos nuevos (y en ese caso tambien hay que agregar sus handlers).
const PROXIES = ["RegistroEntidades", "TokenCustodia", "MercadoCertificados"] as const;

async function main() {
  const nombre = process.env.CONTRACT;
  if (!nombre || !(PROXIES as readonly string[]).includes(nombre)) {
    throw new Error(`Falta CONTRACT (uno de: ${PROXIES.join(", ")})`);
  }

  const connection = await network.create();
  const { ethers } = connection;
  const upgradesApi = await upgrades(hre, connection);
  const [deployer] = await ethers.getSigners();

  const deploymentPath = path.join(import.meta.dirname, "..", "deployments", `${connection.networkName}.json`);
  const deployment = JSON.parse(await readFile(deploymentPath, "utf-8"));
  const proxyAddress: string = deployment.contracts[nombre].address;

  console.log(`Upgrade de ${nombre} en ${proxyAddress} (red ${connection.networkName}, cuenta ${deployer.address})`);

  const implAnterior = await upgradesApi.erc1967.getImplementationAddress(proxyAddress);
  const Factory = await ethers.getContractFactory(nombre);
  const upgraded = await upgradesApi.upgradeProxy(proxyAddress, Factory);
  await upgraded.waitForDeployment();
  // Los RPC publicos balancean entre nodos: la lectura inmediata puede venir de un nodo que
  // todavia no vio el bloque del upgrade y devolver la implementacion vieja (paso en el
  // upgrade del 2026-11-20). Se reintenta hasta ver el cambio.
  let implNueva = await upgradesApi.erc1967.getImplementationAddress(proxyAddress);
  for (let i = 0; i < 12 && implNueva.toLowerCase() === implAnterior.toLowerCase(); i++) {
    await new Promise((r) => setTimeout(r, 5_000));
    implNueva = await upgradesApi.erc1967.getImplementationAddress(proxyAddress);
  }

  console.log(`Implementacion: ${implAnterior} -> ${implNueva}`);
  if (implNueva.toLowerCase() === implAnterior.toLowerCase()) {
    console.warn(
      "La implementacion no cambio: o el bytecode era identico (nada que subir) o el RPC sigue " +
        "atrasado. Verificar leyendo el slot EIP-1967 del proxy en el explorador.",
    );
  }
  console.log("Listo. Ahora: npm run contracts:export && npm run frontend:generate");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
