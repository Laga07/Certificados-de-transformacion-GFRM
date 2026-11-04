import hre, { network } from "hardhat";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Uso: npx hardhat run scripts/verify-centro.ts --network localhost
// La direccion del centro a verificar se lee de la variable de entorno CENTRO_ADDRESS.
async function main() {
  const centroAddress = process.env.CENTRO_ADDRESS;
  if (!centroAddress) throw new Error("Falta CENTRO_ADDRESS en el entorno");

  const connection = await network.create();
  const { ethers } = connection;
  const [admin] = await ethers.getSigners();

  const deploymentRaw = await readFile(
    path.join(import.meta.dirname, "..", "deployments", "localhost.json"),
    "utf-8",
  );
  const deployment = JSON.parse(deploymentRaw);

  const registro = await ethers.getContractAt(
    "RegistroEntidades",
    deployment.contracts.RegistroEntidades.address,
    admin,
  );

  const tx = await registro.verificarCentro(centroAddress);
  await tx.wait();
  console.log(`Centro ${centroAddress} verificado por ${admin.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
