import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build autocontenido para Docker: .next/standalone trae un server.js y solo las
  // dependencias que la app usa de verdad (imagen mucho mas chica que copiar node_modules).
  output: "standalone",
  // Monorepo: el trazado de dependencias tiene que partir de la raiz, donde npm workspaces
  // deja node_modules. Asi el server queda en .next/standalone/packages/frontend/server.js.
  outputFileTracingRoot: path.join(import.meta.dirname, "..", ".."),
  poweredByHeader: false,
};

export default nextConfig;
