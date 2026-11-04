import { readFile } from "node:fs/promises";
import path from "node:path";
import hre, { network } from "hardhat";
import { upgrades } from "@openzeppelin/hardhat-upgrades";

// Sube una nueva implementacion de TransaccionesPlastico al proxy UUPS ya desplegado --
// la direccion del proxy (la que usan backend/frontend) no cambia, solo la logica detras.
// Uso: npx hardhat run scripts/upgrade-transacciones.ts --network amoy
async function main() {
  const connection = await network.create();
  const { ethers } = connection;
  const upgradesApi = await upgrades(hre, connection);

  const [signer] = await ethers.getSigners();
  console.log(`Actualizando en "${connection.networkName}" con la cuenta ${signer.address}`);

  const deploymentRaw = await readFile(
    path.join(import.meta.dirname, "..", "deployments", `${connection.networkName}.json`),
    "utf-8",
  );
  const deployment = JSON.parse(deploymentRaw);
  const proxyAddress = deployment.contracts.TransaccionesPlastico.address;

  const TransaccionesPlastico = await ethers.getContractFactory("TransaccionesPlastico", signer);
  const upgraded = await upgradesApi.upgradeProxy(proxyAddress, TransaccionesPlastico);
  await upgraded.waitForDeployment();

  const newImplementation = await upgradesApi.erc1967.getImplementationAddress(proxyAddress);
  console.log(`Proxy sin cambios: ${proxyAddress}`);
  console.log(`Nueva implementacion: ${newImplementation}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
