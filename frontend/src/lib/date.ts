const DAY_MS = 24 * 60 * 60 * 1000;

const timeFormatter = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" });
const weekdayFormatter = new Intl.DateTimeFormat("id-ID", { weekday: "long" });
const monthFormatter = new Intl.DateTimeFormat("id-ID", { month: "short" });
const fullDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const shortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export interface DayGroup<T> {
  key: string;
  date: Date;
  items: T[];
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

// kunci hari berdasarkan zona waktu perangkat, contoh 2026-11-14
export function toDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function formatTime(date: Date): string {
  return timeFormatter.format(date);
}

export function formatMonth(date: Date): string {
  return monthFormatter.format(date).replace(".", "");
}

export function formatShortDate(date: Date): string {
  return shortDateFormatter.format(date);
}

// label relatif untuk judul grup agenda beserta tanggal lengkapnya
export function describeDay(date: Date, now: Date): { label: string; detail: string } {
  const diff = Math.round((startOfDay(date) - startOfDay(now)) / DAY_MS);
  const relative: Record<number, string> = { [-1]: "Kemarin", 0: "Hari ini", 1: "Besok" };
  return {
    label: relative[diff] ?? weekdayFormatter.format(date),
    detail: fullDateFormatter.format(date),
  };
}

// mengelompokkan item berurutan yang jatuh di hari yang sama tanpa mengubah urutan aslinya
export function groupByDay<T>(items: T[], getDate: (item: T) => Date): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];
  for (const item of items) {
    const date = getDate(item);
    const key = toDayKey(date);
    const last = groups.at(-1);
    if (last && last.key === key) {
      last.items.push(item);
    } else {
      groups.push({ key, date, items: [item] });
    }
  }
  return groups;
}
