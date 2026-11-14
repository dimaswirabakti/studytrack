import { useEffect, useState } from "react";

// waktu sekarang yang diperbarui berkala supaya label relatif seperti hari ini tetap akurat
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
