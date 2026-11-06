import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const CONTRACTS_ROOT = path.join(import.meta.dirname, "..", "artifacts", "contracts");
const DEPLOYMENTS_DIR = path.join(import.meta.dirname, "..", "deployments");
const EXPORTED_ABIS_DIR = path.join(import.meta.dirname, "..", "exported", "abis");
const EXPORTED_ADDRESSES_DIR = path.join(import.meta.dirname, "..", "exported", "addresses");

// Fuente + nombre del contrato -> nombre de archivo exportado
const CONTRATOS_A_EXPORTAR = [
  { source: "RegistroEntidades.sol", name: "RegistroEntidades" },
  { source: "TokenCustodia.sol", name: "TokenCustodia" },
  { source: "CertificadoTransformacion.sol", name: "CertificadoTransformacion" },
  { source: "MercadoCertificados.sol", name: "MercadoCertificados" },
  { source: "mocks/MockUSDT.sol", name: "MockUSDT" },
];

async function exportAbis() {
  await mkdir(EXPORTED_ABIS_DIR, { recursive: true });

  for (const { source, name } of CONTRATOS_A_EXPORTAR) {
    const artifactPath = path.join(CONTRACTS_ROOT, source, `${name}.json`);
    const artifact = JSON.parse(await readFile(artifactPath, "utf-8"));

    const outputPath = path.join(EXPORTED_ABIS_DIR, `${name}.json`);
    await writeFile(outputPath, JSON.stringify(artifact.abi, null, 2));
    console.log(`ABI de ${name} exportado a ${outputPath}`);
  }
}

async function exportAddresses() {
  await mkdir(EXPORTED_ADDRESSES_DIR, { recursive: true });

  let files: string[] = [];
  try {
    files = await readdir(DEPLOYMENTS_DIR);
  } catch {
    console.warn(`No existe ${DEPLOYMENTS_DIR} todavia; corre primero scripts/deploy.ts`);
    return;
  }

  for (const file of files.filter((f) => f.endsWith(".json"))) {
    const content = await readFile(path.join(DEPLOYMENTS_DIR, file), "utf-8");
    await writeFile(path.join(EXPORTED_ADDRESSES_DIR, file), content);
    console.log(`Direcciones de ${file} copiadas a ${EXPORTED_ADDRESSES_DIR}`);
  }
}

async function main() {
  await exportAbis();
  await exportAddresses();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
