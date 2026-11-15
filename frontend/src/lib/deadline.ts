const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

// label sisa waktu untuk tugas yang mendekati deadline
export function formatRemaining(remainingMs: number): string {
  if (remainingMs < MINUTE_MS) {
    return "Kurang dari 1 menit lagi";
  }
  const hours = Math.floor(remainingMs / HOUR_MS);
  const minutes = Math.floor((remainingMs % HOUR_MS) / MINUTE_MS);
  if (hours === 0) {
    return `Sisa ${minutes} menit`;
  }
  return minutes === 0 ? `Sisa ${hours} jam` : `Sisa ${hours} jam ${minutes} menit`;
}

// label keterlambatan dibulatkan ke bawah ke satuan terbesar yang masuk akal
export function formatOverdue(remainingMs: number): string {
  const lateMs = Math.abs(remainingMs);
  if (lateMs < HOUR_MS) {
    return `Terlambat ${Math.max(1, Math.floor(lateMs / MINUTE_MS))} menit`;
  }
  if (lateMs < DAY_MS) {
    return `Terlambat ${Math.floor(lateMs / HOUR_MS)} jam`;
  }
  return `Terlambat ${Math.floor(lateMs / DAY_MS)} hari`;
}
