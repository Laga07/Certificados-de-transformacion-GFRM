// Unico lugar donde se resuelve la URL de la API (packages/backend). El fallback es el
// puerto 4001 de ESTE proyecto, no el 4000 de DAPP Plastico Tesis -- ver tabla de puertos en
// el README. Funciona tanto en Server Components / server actions como en Client Components
// (Next inyecta NEXT_PUBLIC_* en el bundle del navegador en tiempo de build).
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";
