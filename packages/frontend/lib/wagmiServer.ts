import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { hardhat, polygonAmoy } from "wagmi/chains";

// Config "liviana" -- SOLO para decodificar la cookie de wagmi en el servidor
// (app/layout.tsx, un Server Component). No puede importar nada de RainbowKit:
// getDefaultConfig() es client-only en esta version de Next, y layout.tsx revienta
// si un Server Component la ejecuta directo (aunque sea solo para leer wagmiConfig.storage).
//
// cookieToInitialState() solo necesita las chains y el storage para parsear el estado
// inicial -- no le importan los conectores -- asi que esta version sin conectores basta.
// La config real (con RainbowKit) sigue viviendo en lib/wagmi.ts, usada unicamente por
// app/providers.tsx (client component), donde SSR de RainbowKit si esta soportado.
const amoyRpcUrl = process.env.NEXT_PUBLIC_AMOY_RPC_URL || polygonAmoy.rpcUrls.default.http[0];

const chains =
  process.env.NODE_ENV === "development" ? ([polygonAmoy, hardhat] as const) : ([polygonAmoy] as const);

export const wagmiServerConfig = createConfig({
  chains,
  connectors: [],
  transports: {
    [polygonAmoy.id]: http(amoyRpcUrl),
    [hardhat.id]: http(hardhat.rpcUrls.default.http[0]),
  },
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
});
