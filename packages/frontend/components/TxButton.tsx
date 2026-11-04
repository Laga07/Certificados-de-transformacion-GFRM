"use client";

import { friendlyTxErrorMessage } from "@/lib/errorMessages";

export function TxButton({
  onClick,
  isPending,
  isConfirming,
  isSuccess,
  error,
  disabled,
  children,
}: {
  onClick: () => void;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error?: Error | null;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 items-start">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isPending || isConfirming}
        className="rounded bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-light disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending
          ? "Confirma en tu wallet..."
          : isConfirming
            ? "Procesando en la chain..."
            : children}
      </button>
      {isSuccess ? (
        <p className="text-sm text-forest">Transacción confirmada en la chain.</p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{friendlyTxErrorMessage(error)}</p> : null}
    </div>
  );
}
