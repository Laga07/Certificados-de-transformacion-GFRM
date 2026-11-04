import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { hardhat, polygonAmoy } from "wagmi/chains";
import { cookieStorage, createConfig, createStorage, http, injected } from "wagmi";
import { metaMask } from "wagmi/connectors";

const amoyRpcUrl = process.env.NEXT_PUBLIC_AMOY_RPC_URL || polygonAmoy.rpcUrls.default.http[0];
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Nota sobre el gas minimo de Polygon: se intento fijar `chain.fees.defaultPriorityFee` aca,
// pero no aplica -- para una wallet inyectada (MetaMask) via wagmi, viem trata la cuenta como
// "json-rpc account" y se salta su propia preparacion/estimacion de fees, delegandole el gas
// entero a la wallet. El fix real esta en lib/gasOverrides.ts, pasado explicito en cada
// writeContract() de los formularios.

// En desarrollo tambien habilitamos la chain "hardhat" (chainId 31337) para poder probar
// contra un nodo local (`npx hardhat node`) sin necesidad de una wallet fondeada en Amoy.
const chains =
  process.env.NODE_ENV === "development" ? ([polygonAmoy, hardhat] as const) : ([polygonAmoy] as const);

// Cookie storage: necesario para que wagmi hidrate correctamente el estado de conexion
// entre servidor y cliente (ver app/layout.tsx + app/providers.tsx, que pasan `initialState`
// calculado con cookieToInitialState). Sin esto, `ssr: true` por si solo no evita carreras
// de reconexion al navegar entre paginas.
const storage = createStorage({ storage: cookieStorage });

const transports = {
  [polygonAmoy.id]: http(amoyRpcUrl),
  [hardhat.id]: http(hardhat.rpcUrls.default.http[0]),
};

// Sin NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID, RainbowKit no puede habilitar WalletConnect v2
// (getDefaultConfig lanza un error). En ese caso usamos conectores explicitos (MetaMask +
// generico inyectado) en vez del `injected()` desnudo: RainbowKit los reconoce mejor en su
// modal de conexion.
export const wagmiConfig = projectId
  ? getDefaultConfig({
      appName: "GreenMaterialsDAPP",
      projectId,
      chains,
      transports,
      storage,
      ssr: true,
    })
  : createConfig({
      chains,
      connectors: [metaMask(), injected()],
      transports,
      storage,
      ssr: true,
    });
