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
    TokenCustodia: { address: string };
    CertificadoTransformacionImpl: { address: string };
    MercadoCertificados: { address: string };
    Certificados: Record<string, string>; // simbolo -> direccion del clone
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
  // batchMaxCount: 1 -- ver nota en DAPP Plastico Tesis: dRPC free plan rechaza un batch de
  // varias llamadas agrupadas si suman mas de 10,000 bloques combinados, aunque cada una
  // individualmente este dentro del limite. Desactivar el agrupamiento automatico de
  // ethers evita el problema de raiz.
  return new ethers.JsonRpcProvider(rpcUrl, undefined, { batchMaxCount: 1 });
}

export interface IndexedContracts {
  deployment: Deployment;
  registro: ethers.Contract;
  custodia: ethers.Contract;
  mercado: ethers.Contract;
  // Un contrato ERC20 por material, indexado por el mismo nombre de simbolo que aparece en
  // deployment.contracts.Certificados (ej. "CERT-PLAST"). Todas las instancias comparten la
  // misma ABI (CertificadoTransformacion), solo cambia la direccion.
  certificados: Record<string, ethers.Contract>;
}

export async function getIndexedContracts(
  provider: ethers.Provider,
  networkName: string = NETWORK_NAME,
): Promise<IndexedContracts> {
  const deployment = await loadDeployment(networkName);

  const [registroAbi, custodiaAbi, mercadoAbi, certificadoAbi] = await Promise.all([
    loadAbi("RegistroEntidades"),
    loadAbi("TokenCustodia"),
    loadAbi("MercadoCertificados"),
    loadAbi("CertificadoTransformacion"),
  ]);

  const certificados: Record<string, ethers.Contract> = {};
  for (const [simbolo, direccion] of Object.entries(deployment.contracts.Certificados)) {
    certificados[simbolo] = new ethers.Contract(direccion, certificadoAbi, provider);
  }

  return {
    deployment,
    registro: new ethers.Contract(
      deployment.contracts.RegistroEntidades.address,
      registroAbi,
      provider,
    ),
    custodia: new ethers.Contract(
      deployment.contracts.TokenCustodia.address,
      custodiaAbi,
      provider,
    ),
    mercado: new ethers.Contract(
      deployment.contracts.MercadoCertificados.address,
      mercadoAbi,
      provider,
    ),
    certificados,
  };
}
