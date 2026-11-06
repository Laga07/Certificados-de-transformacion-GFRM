import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

// packages/contracts/deployments/<network>.json es la fuente de verdad para direcciones
// desplegadas (generado por packages/contracts/scripts/deploy.ts). Solo se lee del lado
// del servidor: los Server Components pasan las direcciones como props a Client Components.
const DEPLOYMENTS_DIR = path.join(process.cwd(), "..", "contracts", "deployments");

// En desarrollo, si aun no hay un deploy real a "amoy", caemos a un deploy local
// ("localhost.json", de `npx hardhat node` + `npm run deploy:amoy -- --network localhost`)
// para poder probar la interfaz completa sin necesidad de credenciales de Amoy.
const DEPLOYMENT_CANDIDATES =
  process.env.NODE_ENV === "development" ? ["amoy.json", "localhost.json"] : ["amoy.json"];

// Simbolos del catalogo inicial de certificados (ver packages/contracts/scripts/deploy.ts) --
// coincide 1 a 1 con el enum Material (indice = posicion en este arreglo).
export const MATERIAL_SIMBOLOS = [
  "CERT-PLAST",
  "CERT-CART",
  "CERT-TETRA",
  "CERT-VIDRIO",
  "CERT-METAL",
] as const;

export interface DeploymentAddresses {
  chainId: number;
  startBlock: number;
  MockUSDT: `0x${string}`;
  RegistroEntidades: `0x${string}`;
  TokenCustodia: `0x${string}`;
  MercadoCertificados: `0x${string}`;
  // Direccion del clon de CertificadoTransformacion por indice de Material (0=Plastico...4=Metales).
  Certificados: (`0x${string}` | undefined)[];
}

export function getDeploymentAddresses(): DeploymentAddresses | null {
  for (const fileName of DEPLOYMENT_CANDIDATES) {
    try {
      const raw = readFileSync(path.join(DEPLOYMENTS_DIR, fileName), "utf-8");
      const deployment = JSON.parse(raw) as {
        chainId: number;
        startBlock: number;
        contracts: Record<string, { address: `0x${string}` } | Record<string, `0x${string}`>>;
      };

      const certificadosMap = deployment.contracts.Certificados as
        | Record<string, `0x${string}`>
        | undefined;

      return {
        chainId: deployment.chainId,
        startBlock: deployment.startBlock,
        MockUSDT: (deployment.contracts.MockUSDT as { address: `0x${string}` }).address,
        RegistroEntidades: (deployment.contracts.RegistroEntidades as { address: `0x${string}` })
          .address,
        TokenCustodia: (deployment.contracts.TokenCustodia as { address: `0x${string}` }).address,
        MercadoCertificados: (
          deployment.contracts.MercadoCertificados as { address: `0x${string}` }
        ).address,
        Certificados: MATERIAL_SIMBOLOS.map((simbolo) => certificadosMap?.[simbolo]),
      };
    } catch {
      continue;
    }
  }

  return null;
}
