"use client";

import { useWaitForTransactionReceipt } from "wagmi";

/**
 * Wrapper sobre useWaitForTransactionReceipt: wagmi solo garantiza que se obtuvo un recibo,
 * no que la transaccion haya tenido exito -- una tx revertida en la chain igual produce un
 * recibo valido (receipt.status === "reverted"), asi que el `isSuccess` crudo del hook queda
 * en true aunque el contrato haya revertido el cambio. Este wrapper corrige eso: separa el
 * exito real del revert, para no mostrarle "confirmado" al usuario cuando en realidad fallo.
 */
export function useTxReceipt(hash: `0x${string}` | undefined) {
  const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const isSuccess = isConfirmed && receipt?.status === "success";
  const revertedError =
    isConfirmed && receipt?.status === "reverted"
      ? new Error(
          "La transaccion se mino pero el contrato la revirtio (el cambio no se aplico). " +
            "Revisa que cumplas los requisitos de esta accion (rol, estado del lote, gas suficiente, etc.) e intenta de nuevo.",
        )
      : null;

  // Se expone el recibo crudo para los casos donde hace falta leer un evento especifico
  // (ej. el loteId asignado por el contrato en LoteMunicipalIniciado) en vez de solo saber
  // si la transaccion tuvo exito.
  return { isConfirming, isSuccess, revertedError, receipt };
}
