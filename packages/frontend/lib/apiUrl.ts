// URL de la API (packages/backend).
//
// API_URL: la que usa el NAVEGADOR. En produccion la API se sirve bajo el mismo dominio que
// el sitio (Caddy manda /api/* al contenedor de la API), asi la cookie de sesion httpOnly del
// sitio viaja sola y no hace falta CORS. En desarrollo, http://localhost:4001 (puerto propio
// de este proyecto, no el 4000 de DAPP Plastico Tesis -- ver README).
//
// API_URL_SERVER: la que usan Server Components y server actions. En Docker apunta directo
// al contenedor (http://api:4001) en vez de salir a internet y volver por Caddy. Solo se usa
// en codigo de servidor: nunca renderizarla en HTML (no coincidiria con la del navegador).
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export const API_URL_SERVER = process.env.API_INTERNAL_URL ?? API_URL;
