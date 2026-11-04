import type { Metadata } from "next";
import { Fraunces, Public_Sans, Space_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import jwt from "jsonwebtoken";
import "./globals.css";
import { Providers } from "./providers";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { ChainGuard } from "@/components/ChainGuard";
import { Footer } from "@/components/Footer";
import { NavMenu } from "@/components/NavMenu";
import { wagmiServerConfig } from "@/lib/wagmiServer";
import { getDeploymentAddresses } from "@/lib/addresses.server";
import { logoutAction } from "./login/actions";
import logo from "../public/GFRM-Logo.png";

function getSessionEmail(sessionCookie: string | undefined): string | null {
  const secret = process.env.JWT_SECRET;
  if (!sessionCookie || !secret) return null;
  try {
    const payload = jwt.verify(sessionCookie, secret);
    return typeof payload === "object" && "email" in payload ? String(payload.email) : null;
  } catch {
    return null;
  }
}

// Fraunces: serif con caracter para titulos (estilo "guia de campo" / informe de campo).
// Se carga con estilo italica ademas de la normal -- la portada y los titulares grandes
// usan italica como firma visual de esta direccion.
const fraunces = Fraunces({
  variable: "--font-heading",
  weight: ["500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const publicSans = Public_Sans({
  variable: "--font-body",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

// Space Mono: texto tipo "etiqueta de espécimen" -- badges, datos, direcciones de wallet.
const spaceMono = Space_Mono({
  variable: "--font-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DAPP Certificado de Transformación",
  description:
    "Trazabilidad multi-material y Certificado de Transformación (ERC20) sobre Polygon Amoy",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Si el navegador trae una cookie de wagmi corrupta o mal codificada, cookieToInitialState
  // revienta con un SyntaxError de JSON.parse -- y como esto corre en el layout raiz, tumbaria
  // TODA pagina del sitio. Preferimos perder la hidratacion SSR de la wallet (wagmi reconecta
  // igual del lado del cliente) antes que romper el sitio entero por una cookie invalida.
  let initialState;
  try {
    initialState = cookieToInitialState(wagmiServerConfig, (await headers()).get("cookie"));
  } catch {
    initialState = undefined;
  }
  const sessionEmail = getSessionEmail((await cookies()).get("session")?.value);
  const deployment = getDeploymentAddresses();

  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${publicSans.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers initialState={initialState}>
          <header className="border-b border-neutral-300 bg-background">
            <div className="px-4 py-1.5 flex justify-between label-mono text-[0.65rem] border-b border-neutral-200">
              <span>Registro de campo &middot; trazabilidad y Certificado de Transformación</span>
              <span className="hidden sm:inline">Polygon Amoy &middot; GAM, Costa Rica</span>
            </div>
            <div className="px-4 py-3 flex flex-wrap items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 font-heading italic font-semibold text-forest text-lg"
              >
                <Image
                  src={logo}
                  alt="Green Foot Recycling Materials"
                  width={40}
                  height={40}
                  priority
                  className="rounded-full"
                />
                Certificado de Transformación
              </Link>
              <NavMenu />
              <div className="flex items-center gap-3">
                <ConnectWalletButton plasticoTokenAddress={deployment?.PlasticoToken} />
                {sessionEmail ? (
                  <form action={logoutAction} className="flex items-center gap-2 text-xs text-neutral-500">
                    <span className="hidden sm:inline">{sessionEmail}</span>
                    <button type="submit" className="text-forest hover:underline">
                      Cerrar sesión
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </header>
          <ChainGuard />
          <main className="flex-1 p-6 max-w-5xl w-full mx-auto">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
