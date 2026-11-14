import { readFile } from "node:fs/promises";
import path from "node:path";
import { network } from "hardhat";

// Separa las llaves operativas de la llave de administracion (plan de produccion, A5):
// despues del deploy, el deployer tiene TODOS los roles. Este script otorga VERIFIER_ROLE y
// PAUSER_ROLE a wallets operativas distintas (y opcionalmente apunta `plataforma` a otra
// direccion, ej. un Safe), para que la llave que puede hacer upgrades no sea la misma que
// se usa todos los dias para verificar entidades.
//
// Uso (variables de entorno, todas opcionales -- se aplica solo lo que este definido):
//   VERIFIER_WALLET=0x...  PAUSER_WALLET=0x...  PLATAFORMA_WALLET=0x... \
//   npx hardhat run scripts/grant-roles.ts --network amoy
//
// Es idempotente: si la wallet ya tiene el rol, lo salta.
async function main() {
  const connection = await network.create();
  const { ethers } = connection;
  const [admin] = await ethers.getSigners();

  const deploymentPath = path.join(import.meta.dirname, "..", "deployments", `${connection.networkName}.json`);
  const deployment = JSON.parse(await readFile(deploymentPath, "utf-8"));

  const registro = await ethers.getContractAt("RegistroEntidades", deployment.contracts.RegistroEntidades.address);
  const custodia = await ethers.getContractAt("TokenCustodia", deployment.contracts.TokenCustodia.address);
  const mercado = await ethers.getContractAt("MercadoCertificados", deployment.contracts.MercadoCertificados.address);

  console.log(`Red ${connection.networkName}, admin ${admin.address}`);

  async function grant(contrato: any, nombre: string, role: string, roleName: string, wallet: string | undefined) {
    if (!wallet) return;
    const destino = ethers.getAddress(wallet);
    if (await contrato.hasRole(role, destino)) {
      console.log(`  ${nombre}.${roleName} ya lo tiene ${destino} -- se salta`);
      return;
    }
    const tx = await contrato.connect(admin).grantRole(role, destino);
    await tx.wait();
    console.log(`  ${nombre}.${roleName} otorgado a ${destino} (${tx.hash})`);
  }

  const verifier = process.env.VERIFIER_WALLET;
  const pauser = process.env.PAUSER_WALLET;
  const plataforma = process.env.PLATAFORMA_WALLET;

  await grant(registro, "RegistroEntidades", await registro.VERIFIER_ROLE(), "VERIFIER_ROLE", verifier);
  await grant(custodia, "TokenCustodia", await custodia.PAUSER_ROLE(), "PAUSER_ROLE", pauser);
  await grant(mercado, "MercadoCertificados", await mercado.PAUSER_ROLE(), "PAUSER_ROLE", pauser);

  if (plataforma) {
    const destino = ethers.getAddress(plataforma);
    const actual = await mercado.plataforma();
    if (actual.toLowerCase() === destino.toLowerCase()) {
      console.log(`  MercadoCertificados.plataforma ya es ${destino} -- se salta`);
    } else {
      const tx = await mercado.connect(admin).setPlataforma(destino);
      await tx.wait();
      console.log(`  MercadoCertificados.plataforma: ${actual} -> ${destino} (${tx.hash})`);
    }
  }

  if (!verifier && !pauser && !plataforma) {
    console.log("Nada que hacer: defini VERIFIER_WALLET, PAUSER_WALLET y/o PLATAFORMA_WALLET.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
