import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ethers } from "ethers";

// packages/contracts es la unica fuente de verdad para ABIs y direcciones desplegadas.
// export-abi.ts (packages/contracts/scripts) genera estos archivos tras cada deploy.
const CONTRACTS_PKG_DIR = path.join(import.meta.dirname, "..", "..", "..", "contracts");
const NETWORK_NAME = process.env.NETWORK_NAME ?? "amoy";

export interface Deployment {
  network: string;
  chainId: number;
  deployer: string;
  startBlock: number;
  contracts: {
    MockUSDT: { address: string };
    RegistroEntidades: { address: string };
    PlasticoToken: { address: string };
    TransaccionesPlastico: { address: string };
  };
}

async function loadAbi(name: string): Promise<ethers.InterfaceAbi> {
  const raw = await readFile(
    path.join(CONTRACTS_PKG_DIR, "exported", "abis", `${name}.json`),
    "utf-8",
  );
  return JSON.parse(raw);
}

export async function loadDeployment(networkName: string = NETWORK_NAME): Promise<Deployment> {
  const raw = await readFile(
    path.join(CONTRACTS_PKG_DIR, "deployments", `${networkName}.json`),
    "utf-8",
  );
  return JSON.parse(raw);
}

export function getProvider(): ethers.JsonRpcProvider {
  const rpcUrl = process.env.AMOY_RPC_URL;
  if (!rpcUrl) {
    throw new Error("AMOY_RPC_URL no esta definido en el entorno");
  }
  // batchMaxCount: 1 desactiva el agrupamiento automatico de ethers (por defecto junta
  // varias llamadas RPC hechas en el mismo tick en un solo POST con un array de
  // requests). Con dRPC gratis eso rompia el indexador: dos eth_getLogs de 5,000
  // bloques cada uno (bien dentro del limite individual) se agrupaban en un batch y
  // dRPC rechazaba el batch entero por sumar 10,000 bloques combinados. Cada llamada
  // sale ahora por su cuenta, en su propio POST.
  return new ethers.JsonRpcProvider(rpcUrl, undefined, { batchMaxCount: 1 });
}

export interface IndexedContracts {
  deployment: Deployment;
  registro: ethers.Contract;
  transacciones: ethers.Contract;
  token: ethers.Contract;
}

export async function getIndexedContracts(
  provider: ethers.Provider,
  networkName: string = NETWORK_NAME,
): Promise<IndexedContracts> {
  const deployment = await loadDeployment(networkName);

  const [registroAbi, transaccionesAbi, tokenAbi] = await Promise.all([
    loadAbi("RegistroEntidades"),
    loadAbi("TransaccionesPlastico"),
    loadAbi("PlasticoToken"),
  ]);

  return {
    deployment,
    registro: new ethers.Contract(
      deployment.contracts.RegistroEntidades.address,
      registroAbi,
      provider,
    ),
    transacciones: new ethers.Contract(
      deployment.contracts.TransaccionesPlastico.address,
      transaccionesAbi,
      provider,
    ),
    token: new ethers.Contract(deployment.contracts.PlasticoToken.address, tokenAbi, provider),
  };
}
