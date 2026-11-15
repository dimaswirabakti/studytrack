import { describe, expect, it } from "vitest";
import { formatOverdue, formatRemaining } from "./deadline";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("formatRemaining", () => {
  it("menampilkan jam dan menit", () => {
    expect(formatRemaining(3 * HOUR + 12 * MINUTE)).toBe("Sisa 3 jam 12 menit");
  });

  it("tidak menampilkan menit jika tepat satu jam penuh", () => {
    expect(formatRemaining(20 * HOUR)).toBe("Sisa 20 jam");
  });

  it("menampilkan menit saja jika kurang dari satu jam", () => {
    expect(formatRemaining(45 * MINUTE)).toBe("Sisa 45 menit");
  });

  it("membulatkan ke bawah supaya sisa waktu tidak terlihat lebih lama", () => {
    expect(formatRemaining(23 * HOUR + 59 * MINUTE + 59 * 1000)).toBe("Sisa 23 jam 59 menit");
  });

  it("menampilkan label khusus jika kurang dari satu menit", () => {
    expect(formatRemaining(30 * 1000)).toBe("Kurang dari 1 menit lagi");
    expect(formatRemaining(0)).toBe("Kurang dari 1 menit lagi");
  });
});

describe("formatOverdue", () => {
  it("menampilkan hari untuk keterlambatan lebih dari sehari", () => {
    expect(formatOverdue(-2 * DAY - 5 * HOUR)).toBe("Terlambat 2 hari");
  });

  it("menampilkan jam untuk keterlambatan kurang dari sehari", () => {
    expect(formatOverdue(-5 * HOUR)).toBe("Terlambat 5 jam");
  });

  it("menampilkan minimal 1 menit tepat setelah deadline", () => {
    expect(formatOverdue(-1)).toBe("Terlambat 1 menit");
  });
});
