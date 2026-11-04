// Contenido de referencia para la guia de clasificacion de plasticos (/guia-plasticos).
// Los "codigo" y "nombre" siguen el sistema internacional de codigos de resina (RIC 1-7),
// el mismo que usa el enum TipoPlastico del contrato (ver lib/catalogos.ts) -- por eso el
// orden y los nombres calzan 1 a 1 con el selector que se usa al registrar una entrega.
//
// Valores de densidad y color son rangos tipicos aproximados de referencia general, no
// mediciones de laboratorio. La prueba de flotacion es la forma mas confiable de diferenciar
// sin equipo especializado; nunca recomendamos quemar el plastico para identificarlo (libera
// gases toxicos, especialmente el PVC).
//
// `icono` es una clave, no un componente -- el mapeo a los iconos de @/components/icons vive
// en la pagina que consume este archivo, para mantener este archivo libre de JSX.
export type IconoEjemplo =
  | "bottle"
  | "jug"
  | "pipe"
  | "bag"
  | "filmRoll"
  | "panel"
  | "cap"
  | "cup"
  | "straw"
  | "eggCarton"
  | "foamBlock"
  | "layers"
  | "cube";

export interface EjemploIlustrado {
  label: string;
  icono: IconoEjemplo;
}

export interface TipoPlasticoInfo {
  codigo: number;
  slug: string;
  nombre: string;
  nombreCompleto: string;
  densidad: string;
  flota: string;
  rigidez: string;
  transparencia: string;
  colorTipico: string;
  ejemplos: EjemploIlustrado[];
  comoReconocerlo: string[];
  notaEspecial?: string;
}

export const GUIA_PLASTICOS: TipoPlasticoInfo[] = [
  {
    codigo: 1,
    slug: "pet",
    nombre: "PET",
    nombreCompleto: "Polietileno tereftalato",
    densidad: "1.38 - 1.41 g/cm³",
    flota: "No, se hunde",
    rigidez: "Rígido",
    transparencia: "Transparente",
    colorTipico: "Cristalino, a veces con tinte verde o azul claro",
    ejemplos: [
      { label: "Botellas de agua", icono: "bottle" },
      { label: "Botellas de gaseosa", icono: "bottle" },
      { label: "Envases de aceite", icono: "bottle" },
    ],
    comoReconocerlo: [
      "Se hunde en agua: es más denso que el agua.",
      "Rígido, pero cede un poco antes de quebrarse.",
      "El fondo suele tener una costura circular por el proceso de soplado.",
      "Casi siempre transparente o con un tinte verde o azul claro.",
      "Se deforma con agua caliente -- por eso casi nunca se reutiliza para líquidos calientes.",
    ],
  },
  {
    codigo: 2,
    slug: "pead",
    nombre: "PEAD",
    nombreCompleto: "Polietileno de alta densidad (HDPE)",
    densidad: "0.94 - 0.97 g/cm³",
    flota: "Sí, flota",
    rigidez: "Semirrígido",
    transparencia: "Opaco",
    colorTipico: "Blanco opaco o de color sólido",
    ejemplos: [
      { label: "Envases de detergente", icono: "jug" },
      { label: "Botellas de champú", icono: "bottle" },
      { label: "Tuberías", icono: "pipe" },
    ],
    comoReconocerlo: [
      "Flota en agua.",
      "Al apretarlo hace un sonido sordo, no crujiente.",
      "Casi nunca es transparente: opaco, lechoso o de color sólido.",
      "Se siente ceroso o cremoso al tacto, distinto al brillo del PET.",
      "Suele venir en envases de boca ancha (frascos, garrafas).",
    ],
  },
  {
    codigo: 3,
    slug: "pvc",
    nombre: "PVC",
    nombreCompleto: "Cloruro de polivinilo",
    densidad: "1.16 - 1.55 g/cm³",
    flota: "No, se hunde",
    rigidez: "Rígido o flexible según aditivos",
    transparencia: "Variable",
    colorTipico: "Blanco o gris (rígido); azulado si es transparente",
    ejemplos: [
      { label: "Tuberías", icono: "pipe" },
      { label: "Láminas", icono: "panel" },
      { label: "Envases de aceite", icono: "bottle" },
    ],
    comoReconocerlo: [
      "Se hunde en agua: uno de los más densos de esta lista.",
      "Se siente más pesado al tacto que un PET del mismo tamaño.",
      "Si es transparente, puede tener un ligero tinte azulado o verdoso.",
      "Con aditivos plastificantes se vuelve flexible (mangueras, cortinas), distinto al tubo rígido.",
      "Nunca lo quemes para identificarlo: libera cloro tóxico al arder.",
    ],
    notaEspecial:
      "Es el plástico con la prueba de quemado más peligrosa -- por eso esta guía solo recomienda pruebas seguras (flotación, tacto, símbolo de reciclaje).",
  },
  {
    codigo: 4,
    slug: "pebd",
    nombre: "PEBD",
    nombreCompleto: "Polietileno de baja densidad (LDPE)",
    densidad: "0.91 - 0.94 g/cm³",
    flota: "Sí, flota",
    rigidez: "Muy flexible",
    transparencia: "Translúcido",
    colorTipico: "Translúcido lechoso",
    ejemplos: [
      { label: "Bolsas plásticas", icono: "bag" },
      { label: "Film plástico", icono: "filmRoll" },
      { label: "Algunas tapas", icono: "cap" },
    ],
    comoReconocerlo: [
      "Flota en agua.",
      "Muy flexible: se estira antes de romperse.",
      "Suena \"crujiente\", como una bolsa de supermercado.",
      "Casi siempre en forma de lámina o film, no de envase rígido.",
    ],
  },
  {
    codigo: 5,
    slug: "pp",
    nombre: "PP",
    nombreCompleto: "Polipropileno",
    densidad: "0.90 - 0.92 g/cm³",
    flota: "Sí, flota (el más liviano)",
    rigidez: "Flexible con memoria",
    transparencia: "Semitransparente",
    colorTipico: "Translúcido o de color, con brillo semi-mate",
    ejemplos: [
      { label: "Tapas de botella", icono: "cap" },
      { label: "Envases de yogur", icono: "cup" },
      { label: "Pajillas", icono: "straw" },
    ],
    comoReconocerlo: [
      "Flota en agua: es el más liviano de los plásticos comunes.",
      "Se dobla muchas veces sin quebrarse (\"bisagra viva\"), como la tapa de un frasco de champú.",
      "Al doblarlo hace un sonido mate, distinto al crujido del PEBD.",
      "Resiste mejor el calor que los demás -- si un envase dice \"apto para microondas\", casi siempre es PP.",
    ],
  },
  {
    codigo: 6,
    slug: "ps",
    nombre: "PS",
    nombreCompleto: "Poliestireno",
    densidad: "1.04 - 1.09 g/cm³ (sólido)",
    flota: "Depende: sólido se hunde, espumado (EPS) flota",
    rigidez: "Rígido y quebradizo",
    transparencia: "Variable",
    colorTipico: "Blanco (EPS) o transparente/color (rígido)",
    ejemplos: [
      { label: "Vasos desechables", icono: "cup" },
      { label: "Hueveras", icono: "eggCarton" },
      { label: "Icopor / EPS", icono: "foamBlock" },
    ],
    comoReconocerlo: [
      "El PS sólido y rígido (cubiertos, hueveras duras) se hunde en agua.",
      "El EPS espumado (icopor) flota porque tiene aire atrapado.",
      "Se quiebra seco, con un chasquido -- no se dobla como el PP.",
      "El EPS se deshace entre los dedos en bolitas pequeñas.",
    ],
    notaEspecial:
      "Es el tipo con la excepción más común: el mismo material \"flota\" o \"se hunde\" según si es espumado o sólido.",
  },
  {
    codigo: 7,
    slug: "otros",
    nombre: "Otros",
    nombreCompleto: "Mezclas y otras resinas",
    densidad: "Variable",
    flota: "Sin prueba única confiable",
    rigidez: "Variable",
    transparencia: "Variable",
    colorTipico: "Variable, sin patrón fijo",
    ejemplos: [
      { label: "Empaques multicapa", icono: "layers" },
      { label: "Policarbonato (PC)", icono: "cube" },
      { label: "ABS", icono: "cube" },
    ],
    comoReconocerlo: [
      "No tiene una prueba única confiable: puede ser una mezcla de materiales.",
      "Buscá el número 7 en el símbolo de reciclaje moldeado en la base del envase.",
      "Ante la duda, consultá directamente con el centro recolector.",
    ],
  },
];
