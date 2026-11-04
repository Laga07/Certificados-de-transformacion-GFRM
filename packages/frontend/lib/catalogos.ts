export const PROVINCIAS = [
  "San José",
  "Alajuela",
  "Cartago",
  "Heredia",
  "Guanacaste",
  "Puntarenas",
  "Limón",
] as const;

// Mismos nombres que el enum Provincia en el contrato y en Prisma (sin espacios),
// usados al filtrar/consultar la API por provincia.
export const PROVINCIA_ENUM_KEYS = [
  "SanJose",
  "Alajuela",
  "Cartago",
  "Heredia",
  "Guanacaste",
  "Puntarenas",
  "Limon",
] as const;

// El contrato guarda esto como un uint8 libre (sin enum on-chain que lo valide -- ver
// PlasticExchange.sol) -- por eso es seguro agregar categorias nuevas, pero SIEMPRE al final
// de la lista. Insertar en el medio corrimiento los indices y reinterpreta silenciosamente
// los registros que ya existen en la chain con un tipoVivienda numerico guardado.
export const TIPOS_VIVIENDA = [
  "Casa",
  "Apartamento",
  "Comercio",
  "Entidad Pública",
  "Industria",
  "Sector Servicios",
  "Otro",
  "Recuperadores Inclusivos",
] as const;

export const TIPOS_PLASTICO = [
  "Desconocido",
  "PET",
  "PEAD",
  "PVC",
  "PEBD",
  "PP",
  "PS",
  "Otros",
] as const;

// Ejemplos comunes por tipo, para el tooltip educativo del selector de plástico
// (banco de contenido del rediseño). Los índices coinciden 1 a 1 con TIPOS_PLASTICO.
export const PLASTICO_EJEMPLOS: Record<(typeof TIPOS_PLASTICO)[number], string | null> = {
  Desconocido: null,
  PET: "Botellas de refresco",
  PEAD: "Botellas de detergente, tapas (HDPE)",
  PVC: "Tubos, botellas de aceite/champú",
  PEBD: "Bolsas de supermercado (LDPE)",
  PP: "Recipientes de yogur, tapas",
  PS: "Empaques, envases de comida (PS/EPS)",
  Otros: null,
};
