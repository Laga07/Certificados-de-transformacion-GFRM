import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

// Gate de aplicacion: hay que estar logueado (email/contrasena) para ver cualquier pagina
// del sitio. Esto es independiente de la wallet -- MetaMask se sigue usando aparte, dentro
// de cada flujo, para firmar transacciones on-chain.
const PUBLIC_PATHS = ["/login", "/crear-cuenta"];
const COOKIE_NAME = "session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.JWT_SECRET;

  if (token && secret) {
    try {
      jwt.verify(token, secret);
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
