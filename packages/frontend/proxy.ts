import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

// Gate de aplicacion: hay que estar logueado (email/contrasena) para ver cualquier pagina
// del sitio. Esto es independiente de la wallet -- MetaMask se sigue usando aparte, dentro
// de cada flujo, para firmar transacciones on-chain.
//
// Ademas, /admin exige rol ADMIN en la cuenta (el payload del JWT lo trae; el backend lo
// vuelve a comprobar contra la DB en cada llamada, esto es solo para no mostrar la pagina).
const PUBLIC_PATHS = [
  "/login",
  "/crear-cuenta",
  "/olvide-contrasena",
  "/restablecer-contrasena",
  "/verificar-correo",
  "/terminos",
  "/privacidad",
  "/guia-inicio",
];
const COOKIE_NAME = "session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.JWT_SECRET;

  if (token && secret) {
    try {
      const payload = jwt.verify(token, secret) as { rol?: string };
      if (pathname.startsWith("/admin") && payload.rol !== "ADMIN") {
        return NextResponse.redirect(new URL("/?sin-permiso=admin", request.url));
      }
      return NextResponse.next();
    } catch {
      // token invalido/vencido: cae al redirect de abajo
    }
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
