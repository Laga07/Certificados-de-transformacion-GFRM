import { defineConfig } from "@wagmi/cli";
import { hardhat } from "@wagmi/cli/plugins";
import { react } from "@wagmi/cli/plugins";

const CONTRACTS_PROJECT = "../contracts";

// No se le pasa `deployments` al plugin a proposito: si se le da una direccion por
// chainId, wagmi la "hornea" fija dentro de cada hook generado, y entonces pasar
// `address` a mano en cada llamada (el patron que usa toda esta app, via
// getDeploymentAddresses() en cada pagina/formulario) se vuelve un error de tipos.
// Las direcciones reales se leen en runtime desde deployments/*.json, no desde aca.
export default defineConfig({
  out: "lib/generated.ts",
  contracts: [],
  plugins: [
    hardhat({
      project: CONTRACTS_PROJECT,
    }),
    react(),
  ],
});
