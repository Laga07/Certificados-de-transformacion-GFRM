/**
 * Traduce errores comunes de wagmi/viem a mensajes accionables en español.
 * Sin esto, el usuario ve el mensaje crudo de la libreria (ej. "Connector not connected.
 * Version: @wagmi/core@2.22.1"), que no explica que hacer.
 */
export function friendlyTxErrorMessage(error: Error): string {
  const name = error.name ?? "";
  const message = error.message ?? "";

  if (name === "ConnectorNotConnectedError" || message.includes("Connector not connected")) {
    return "Tu wallet se desconectó. Reconectala (botón arriba a la derecha) e intentá de nuevo.";
  }

  if (name === "ConnectorChainMismatchError" || message.includes("chain mismatch")) {
    return "Tu wallet está en una red distinta a la de esta transacción. Cambiá de red e intentá de nuevo.";
  }

  if (message.includes("User rejected") || message.includes("User denied")) {
    return "Rechazaste la transacción en tu wallet.";
  }

  if (message.includes("insufficient funds")) {
    return "Fondos insuficientes para pagar el gas de esta transacción.";
  }

  // Rechazo de la red por gas price bajo (no es un revert del contrato -- la transaccion
  // nunca llega a ejecutarse). Comun en Polygon, que exige una propina (priority fee)
  // minima; el estimado de la wallet a veces queda por debajo de ese minimo.
  if (message.includes("gas price below minimum") || message.includes("gas tip cap")) {
    return "Tu wallet propuso una comisión (priority fee) más baja de la que la red de Polygon " +
      "exige como mínimo. En MetaMask, al confirmar, editá el gas manualmente y subí el " +
      "\"priority fee\" a 25-30 gwei o más, después intentá de nuevo.";
  }

  // Fallo del propio nodo RPC que usa la wallet para enviar la transaccion (no es un revert
  // del contrato -- la transaccion nunca se llega a transmitir a la red). El RPC que falla
  // aca es el configurado en la wallet para esta red, no el que usa el sitio para leer datos.
  if (
    message.includes("RPC endpoint not found or unavailable") ||
    message.includes("Failed to fetch") ||
    message.includes("Internal JSON-RPC error") ||
    message.includes("Requested resource not available") ||
    message.includes("returned too many errors")
  ) {
    return "El RPC que tu wallet tiene configurado para esta red no respondió. En MetaMask: " +
      "Configuración > Redes > Polygon Amoy, y cambiá la URL del RPC por otra (por ejemplo " +
      "https://rpc-amoy.polygon.technology/), después intentá de nuevo.";
  }

  // Revert del contrato detectado al estimar el gas (lib/useEscribir.ts), antes de firmar.
  // viem lo formatea como: 'The contract function "x" reverted with the following reason:\n<motivo>'
  const viemRevert = message.match(/reverted with the following reason:\s*\n?\s*([^\n]+)/i);
  if (viemRevert) {
    return `No se envió: el contrato la rechazaría. Motivo: ${viemRevert[1].trim()}`;
  }

  // Revert reasons del contrato suelen venir como "... reason: <mensaje>"
  const revertMatch = message.match(/reason:\s*"?([^"\n]+)"?/i);
  if (revertMatch) {
    return `El contrato revirtió: ${revertMatch[1].trim()}`;
  }

  return message;
}
