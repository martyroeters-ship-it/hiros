import { randomInt, timingSafeEqual } from "node:crypto";

type Entry = { code: string; expires: number; attempts: number };

const globalStore = globalThis as typeof globalThis & {
  __hirosLoginCodes?: Map<string, Entry>;
};
const codes = globalStore.__hirosLoginCodes ?? new Map<string, Entry>();
globalStore.__hirosLoginCodes = codes;

export type LoginIdentifier = {
  key: string;
  channel: "email" | "phone";
  display: string;
  email?: string;
  phone?: string;
};

export function parseLoginIdentifier(raw: string): LoginIdentifier | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.includes("@")) {
    const email = trimmed.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
    return { key: `email:${email}`, channel: "email", display: email, email };
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  let national = digits;
  if (digits.startsWith("0") && digits.length === 11) national = `90${digits.slice(1)}`;
  else if (digits.length === 10) national = `90${digits}`;
  const display = `+${national}`;
  return { key: `phone:${national}`, channel: "phone", display, phone: display };
}

export function issueLoginCode(key: string): string {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  codes.set(key, { code, expires: Date.now() + 10 * 60 * 1000, attempts: 0 });
  return code;
}

export function checkLoginCode(key: string, code: string): "ok" | "invalid" | "expired" {
  const entry = codes.get(key);
  if (!entry || entry.expires < Date.now()) {
    codes.delete(key);
    return "expired";
  }
  entry.attempts += 1;
  if (entry.attempts > 5) {
    codes.delete(key);
    return "expired";
  }
  const submitted = code.trim();
  const a = Buffer.from(entry.code);
  const b = Buffer.from(submitted);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return "invalid";
  return "ok";
}

export function clearLoginCode(key: string) {
  codes.delete(key);
}
