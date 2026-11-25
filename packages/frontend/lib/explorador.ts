// Enlaces al explorador de bloques segun la red del deploy (packages/contracts/deployments).
export function urlExplorador(chainId: number): string {
  return chainId === 137 ? "https://polygonscan.com" : "https://amoy.polygonscan.com";
}

export function urlTx(chainId: number, hash: string): string {
  return `${urlExplorador(chainId)}/tx/${hash}`;
}

export function corto(valor: string, inicio = 6, fin = 4): string {
  return valor.length <= inicio + fin + 1 ? valor : `${valor.slice(0, inicio)}…${valor.slice(-fin)}`;
}
