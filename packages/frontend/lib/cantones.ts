// Los 84 cantones de Costa Rica, por provincia, con su numero oficial dentro de la provincia
// (el "cantonId" que se guarda on-chain y en la DB). El indice del arreglo exterior coincide
// con el enum Provincia del contrato (0 San Jose ... 6 Limon); el numero de canton es la
// posicion + 1 (los cantones se numeran desde 1 en la division territorial administrativa).
// Fuente: Division Territorial Administrativa de Costa Rica (incluye Monteverde, 2021, y
// Puerto Jimenez, 2022).
export const CANTONES_POR_PROVINCIA: readonly (readonly string[])[] = [
  // 0 San Jose (20)
  [
    "San José", "Escazú", "Desamparados", "Puriscal", "Tarrazú", "Aserrí", "Mora", "Goicoechea",
    "Santa Ana", "Alajuelita", "Vázquez de Coronado", "Acosta", "Tibás", "Moravia", "Montes de Oca",
    "Turrubares", "Dota", "Curridabat", "Pérez Zeledón", "León Cortés Castro",
  ],
  // 1 Alajuela (16)
  [
    "Alajuela", "San Ramón", "Grecia", "San Mateo", "Atenas", "Naranjo", "Palmares", "Poás",
    "Orotina", "San Carlos", "Zarcero", "Sarchí", "Upala", "Los Chiles", "Guatuso", "Río Cuarto",
  ],
  // 2 Cartago (8)
  ["Cartago", "Paraíso", "La Unión", "Jiménez", "Turrialba", "Alvarado", "Oreamuno", "El Guarco"],
  // 3 Heredia (10)
  [
    "Heredia", "Barva", "Santo Domingo", "Santa Bárbara", "San Rafael", "San Isidro", "Belén",
    "Flores", "San Pablo", "Sarapiquí",
  ],
  // 4 Guanacaste (11)
  [
    "Liberia", "Nicoya", "Santa Cruz", "Bagaces", "Carrillo", "Cañas", "Abangares", "Tilarán",
    "Nandayure", "La Cruz", "Hojancha",
  ],
  // 5 Puntarenas (13)
  [
    "Puntarenas", "Esparza", "Buenos Aires", "Montes de Oro", "Osa", "Quepos", "Golfito",
    "Coto Brus", "Parrita", "Corredores", "Garabito", "Monteverde", "Puerto Jiménez",
  ],
  // 6 Limon (6)
  ["Limón", "Pococí", "Siquirres", "Talamanca", "Matina", "Guácimo"],
];

export function nombreCanton(provinciaId: number, cantonId: number): string {
  return CANTONES_POR_PROVINCIA[provinciaId]?.[cantonId - 1] ?? `Cantón ${cantonId}`;
}

// Mismo lookup pero desde la clave del enum ("SanJose", "Limon"...) que devuelve la API.
export function nombreCantonPorClave(provinciaKey: string, cantonId: number, claves: readonly string[]): string {
  const idx = claves.indexOf(provinciaKey);
  return idx === -1 ? `Cantón ${cantonId}` : nombreCanton(idx, cantonId);
}
