// El orden de estos arreglos debe coincidir exactamente con los enums de
// contracts/TiposComunes.sol y contracts/RegistroEntidades.sol, y con los enums
// definidos en prisma/schema.prisma.

export const PROVINCIA_POR_INDICE = [
  "SanJose",
  "Alajuela",
  "Cartago",
  "Heredia",
  "Guanacaste",
  "Puntarenas",
  "Limon",
] as const;

export const MATERIAL_POR_INDICE = [
  "Plastico",
  "CartonPapel",
  "Tetrapack",
  "Vidrio",
  "Metales",
] as const;

export const MODALIDAD_ENTREGA_POR_INDICE = ["SinPago", "ConPago", "RutaMunicipal"] as const;

export const QUIEN_ABSORBE_POR_INDICE = ["Envia", "Recibe", "Mitad"] as const;

export function provinciaDesdeIndice(value: bigint | number) {
  return PROVINCIA_POR_INDICE[Number(value)];
}

export function materialDesdeIndice(value: bigint | number) {
  return MATERIAL_POR_INDICE[Number(value)];
}

export function modalidadEntregaDesdeIndice(value: bigint | number) {
  return MODALIDAD_ENTREGA_POR_INDICE[Number(value)];
}

export function quienAbsorbeDesdeIndice(value: bigint | number) {
  return QUIEN_ABSORBE_POR_INDICE[Number(value)];
}
