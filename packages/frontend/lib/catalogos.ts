export const PROVINCIAS = [
  "San José",
  "Alajuela",
  "Cartago",
  "Heredia",
  "Guanacaste",
  "Puntarenas",
  "Limón",
] as const;

// Mismos nombres que el enum Provincia en el contrato y en Prisma (sin espacios), usados al
// filtrar/consultar la API por provincia.
export const PROVINCIA_ENUM_KEYS = [
  "SanJose",
  "Alajuela",
  "Cartago",
  "Heredia",
  "Guanacaste",
  "Puntarenas",
  "Limon",
] as const;

// Coincide 1 a 1 con el enum Material de TiposComunes.sol -- enum REAL (no libre), validado
// on-chain. Append-only: un material nuevo va al final, nunca en medio.
export const MATERIALES = ["Plástico", "Cartón y papel", "Tetrapack", "Vidrio", "Metales"] as const;

export const MATERIAL_SIMBOLOS = [
  "CERT-PLAST",
  "CERT-CART",
  "CERT-TETRA",
  "CERT-VIDRIO",
  "CERT-METAL",
] as const;

// Catalogo de variantes POR MATERIAL -- libre (uint8 sin enum on-chain, igual patron que
// TIPOS_VIVIENDA en DAPP Plastico Tesis), append-only dentro de cada material. Coincide con
// la Tabla 10 del documento de arquitectura.
export const VARIANTES_POR_MATERIAL: Record<(typeof MATERIALES)[number], readonly string[]> = {
  Plástico: ["PET", "PEAD", "PVC", "PEBD", "PP", "PS", "Otros"],
  "Cartón y papel": ["Cartón y papel", "Periódico", "Revistas"],
  Tetrapack: ["Envases multicapa"],
  Vidrio: [],
  Metales: ["Aluminio en latas", "Aluminio en perfiles", "Ferrosos", "Cobre", "Otros no ferrosos"],
};

// Tipo de separador -- libre (uint8 sin enum on-chain), append-only. "Separación en la
// fuente" (hogar/comercio/industria/institución) vs. Recuperador Inclusivo (recupera en
// espacios públicos/vertederos) -- Tabla 5 del documento.
export const TIPOS_SEPARADOR = ["Hogar", "Comercio", "Industria", "Institución", "Recuperador Inclusivo"] as const;

// Subtipo de intermediario -- libre, solo para reporting (no cambia el reparto: todos los
// intermediarios de un lote se reparten el 20% en partes iguales sin importar el subtipo).
export const SUBTIPOS_INTERMEDIARIO = [
  "Recolector",
  "Centro de acopio",
  "Municipalidad / ruta selectiva",
  "Compactador",
  "Transportista",
] as const;

// Ejemplos comunes por variante de plástico, para el tooltip educativo del selector.
export const PLASTICO_EJEMPLOS: Record<string, string | null> = {
  PET: "Botellas de refresco",
  PEAD: "Botellas de detergente, tapas (HDPE)",
  PVC: "Tubos, botellas de aceite/champú",
  PEBD: "Bolsas de supermercado (LDPE)",
  PP: "Recipientes de yogur, tapas",
  PS: "Empaques, envases de comida (PS/EPS)",
  Otros: null,
};

// Claves del enum Material tal como las devuelve la API (mismo orden que MATERIALES).
export const MATERIAL_KEYS = ["Plastico", "CartonPapel", "Tetrapack", "Vidrio", "Metales"] as const;

export function nombreMaterialPorClave(clave: string): string {
  const idx = (MATERIAL_KEYS as readonly string[]).indexOf(clave);
  return idx === -1 ? clave : MATERIALES[idx];
}

export function nombreProvinciaPorClave(clave: string): string {
  const idx = (PROVINCIA_ENUM_KEYS as readonly string[]).indexOf(clave);
  return idx === -1 ? clave : PROVINCIAS[idx];
}
