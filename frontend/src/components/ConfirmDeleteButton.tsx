import { TrashIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { IconButton } from "./ui";

interface ConfirmDeleteButtonProps {
  label: string;
  confirmHint?: string;
  disabled?: boolean;
  onConfirm: () => void;
}

const CONFIRM_TIMEOUT_MS = 4000;

// klik pertama meminta konfirmasi inline, klik kedua baru menghapus
export function ConfirmDeleteButton({
  label,
  confirmHint,
  disabled = false,
  onConfirm,
}: ConfirmDeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) {
      return;
    }
    const timer = setTimeout(() => setConfirming(false), CONFIRM_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [confirming]);

  if (!confirming) {
    return (
      <IconButton label={label} disabled={disabled} onClick={() => setConfirming(true)}>
        <TrashIcon size={18} />
      </IconButton>
    );
  }

  return (
    <button
      type="button"
      title={confirmHint}
      disabled={disabled}
      onClick={onConfirm}
      onBlur={() => setConfirming(false)}
      autoFocus
      className="inline-flex h-10 shrink-0 cursor-pointer items-center rounded-lg bg-red-600 px-3 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
    >
      Yakin hapus?
    </button>
  );
}
