import { createHmac } from "node:crypto";

// Hash de identidad que viaja al contrato (identidadHash / cedulaHash / nombreHash).
//
// Antes se calculaba en el navegador como keccak256(cedula): una cedula costarricense tiene
// ~10^9 valores posibles, asi que cualquiera con la cadena publica delante podia enumerarlas
// todas en segundos y "des-hashear" cada registro. Con HMAC-SHA256 y un secreto que solo
// conoce el servidor (IDENTITY_PEPPER) el hash sigue siendo determinista (la misma cedula da
// el mismo valor, que es lo que el contrato necesita para rechazar duplicados) pero ya no se
// puede invertir sin el secreto. La salida son 32 bytes -> un bytes32 valido tal cual.
//
// Consecuencias operativas:
// - IDENTITY_PEPPER es tan critico como la DB: si se pierde, los hashes nuevos ya no
//   coinciden con los viejos (nadie podria "reconocerse"). Guardarlo en el gestor de secretos
//   del servidor y respaldarlo junto con la DB. Nunca rotarlo sin migrar los registros.
// - El endpoint que lo expone (POST /identidad/hash) requiere sesion y tiene rate limit, para
//   que tampoco sirva como oraculo de enumeracion.
export function normalizarIdentidad(valor: string): string {
  return valor
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // sin tildes
    .toUpperCase()
    .replace(/[\s\-._]/g, ""); // "1-2345-6789" == "1 2345 6789" == "123456789"
}

export function normalizarNombre(valor: string): string {
  return valor
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

function pepper(): string {
  const value = process.env.IDENTITY_PEPPER;
  if (!value || value.length < 32) {
    throw new Error("IDENTITY_PEPPER no esta definido (o es demasiado corto) en el entorno");
  }
  return value;
}

export function hashIdentidad(valorNormalizado: string): `0x${string}` {
  return `0x${createHmac("sha256", pepper()).update(valorNormalizado, "utf8").digest("hex")}`;
}

export function hashCedula(cedula: string): `0x${string}` {
  return hashIdentidad(`cedula:${normalizarIdentidad(cedula)}`);
}

export function hashNombre(nombre: string): `0x${string}` {
  return hashIdentidad(`nombre:${normalizarNombre(nombre)}`);
}
