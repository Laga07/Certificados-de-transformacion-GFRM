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

export interface DeploymentAddresses {
  chainId: number;
  startBlock: number;
  MockUSDT: `0x${string}`;
  RegistroEntidades: `0x${string}`;
  PlasticoToken: `0x${string}`;
  TransaccionesPlastico: `0x${string}`;
}

export function getDeploymentAddresses(): DeploymentAddresses | null {
  for (const fileName of DEPLOYMENT_CANDIDATES) {
    try {
      const raw = readFileSync(path.join(DEPLOYMENTS_DIR, fileName), "utf-8");
      const deployment = JSON.parse(raw) as {
        chainId: number;
        startBlock: number;
        contracts: Record<string, { address: `0x${string}` }>;
      };

      return {
        chainId: deployment.chainId,
        startBlock: deployment.startBlock,
        MockUSDT: deployment.contracts.MockUSDT.address,
        RegistroEntidades: deployment.contracts.RegistroEntidades.address,
        PlasticoToken: deployment.contracts.PlasticoToken.address,
        TransaccionesPlastico: deployment.contracts.TransaccionesPlastico.address,
      };
    } catch {
      continue;
    }
  }

  return null;
}
