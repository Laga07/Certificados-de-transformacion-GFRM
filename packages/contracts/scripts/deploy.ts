import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import hre, { network } from "hardhat";
import { upgrades } from "@openzeppelin/hardhat-upgrades";

async function main() {
  const connection = await network.create();
  const { ethers } = connection;
  const upgradesApi = await upgrades(hre, connection);

  const [deployer] = await ethers.getSigners();
  console.log(`Desplegando en la red "${connection.networkName}" con la cuenta ${deployer.address}`);

  // 1) MockUSDT (no upgradeable, solo para testnet)
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy(deployer.address);
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log(`MockUSDT desplegado en ${usdtAddress}`);

  // 2) RegistroEntidades (proxy UUPS)
  const RegistroEntidades = await ethers.getContractFactory("RegistroEntidades");
  const registro = await upgradesApi.deployProxy(RegistroEntidades, [deployer.address]);
  await registro.waitForDeployment();
  const registroAddress = await registro.getAddress();
  console.log(`RegistroEntidades (proxy) desplegado en ${registroAddress}`);

  // 3) PlasticoToken (proxy UUPS)
  const PlasticoToken = await ethers.getContractFactory("PlasticoToken");
  const token = await upgradesApi.deployProxy(PlasticoToken, [
    "Plastico Token",
    "PLST",
    deployer.address,
  ]);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`PlasticoToken (proxy) desplegado en ${tokenAddress}`);

  // 4) TransaccionesPlastico (proxy UUPS)
  const TransaccionesPlastico = await ethers.getContractFactory("TransaccionesPlastico");
  const transacciones = await upgradesApi.deployProxy(TransaccionesPlastico, [
    deployer.address,
    tokenAddress,
    registroAddress,
    usdtAddress,
  ]);
  await transacciones.waitForDeployment();
  const transaccionesAddress = await transacciones.getAddress();
  console.log(`TransaccionesPlastico (proxy) desplegado en ${transaccionesAddress}`);

  // 5) Wiring de roles: sin esto, TransaccionesPlastico no puede mintear PlasticoToken.
  // Es el paso que mas facil se olvida al desplegar manualmente.
  const MINTER_ROLE = await token.MINTER_ROLE();
  const wireTx = await token.connect(deployer).grantRole(MINTER_ROLE, transaccionesAddress);
  await wireTx.wait();
  console.log(`MINTER_ROLE otorgado a TransaccionesPlastico (${transaccionesAddress})`);

  const deploymentBlock = await ethers.provider.getBlockNumber();

  const output = {
    network: connection.networkName,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    startBlock: deploymentBlock,
    contracts: {
      MockUSDT: { address: usdtAddress },
      RegistroEntidades: { address: registroAddress },
      PlasticoToken: { address: tokenAddress },
      TransaccionesPlastico: { address: transaccionesAddress },
    },
  };

  const deploymentsDir = path.join(import.meta.dirname, "..", "deployments");
  await mkdir(deploymentsDir, { recursive: true });
  const outputPath = path.join(deploymentsDir, `${connection.networkName}.json`);
  await writeFile(outputPath, JSON.stringify(output, null, 2));
  console.log(`Direcciones guardadas en ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
