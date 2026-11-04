// El orden de estos arreglos debe coincidir exactamente con los enums de
// contracts/PlasticExchange.sol y con los enums definidos en prisma/schema.prisma.

export const PROVINCIA_POR_INDICE = [
  "SanJose",
  "Alajuela",
  "Cartago",
  "Heredia",
  "Guanacaste",
  "Puntarenas",
  "Limon",
] as const;

export const TIPO_PLASTICO_POR_INDICE = [
  "Desconocido",
  "PET",
  "PEAD",
  "PVC",
  "PEBD",
  "PP",
  "PS",
  "Otros",
] as const;

export const TIPO_TRANSACCION_POR_INDICE = [
  "UsuarioACentroGratis",
  "UsuarioACentroUsuarioRecibe",
  "UsuarioACentroUsuarioPaga",
  "UsuarioAMunicipalidad",
  "CentroACentro",
  "ReconciliacionMunicipal",
] as const;

export function provinciaDesdeIndice(value: bigint | number) {
  return PROVINCIA_POR_INDICE[Number(value)];
}

export function tipoPlasticoDesdeIndice(value: bigint | number) {
  return TIPO_PLASTICO_POR_INDICE[Number(value)];
}

export function tipoTransaccionDesdeIndice(value: bigint | number) {
  return TIPO_TRANSACCION_POR_INDICE[Number(value)];
}
