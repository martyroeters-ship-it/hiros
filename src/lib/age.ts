export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateOfBirth(raw: string): { year: number; month: number; day: number } | null {
  const value = raw.trim();
  if (!value) return null;

  let year = 0;
  let month = 0;
  let day = 0;

  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(value);
  const dmy = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(value);
  const compact = /^(\d{2})(\d{2})(\d{4})$/.exec(value);

  if (iso) {
    year = Number(iso[1]);
    month = Number(iso[2]);
    day = Number(iso[3]);
  } else if (dmy) {
    day = Number(dmy[1]);
    month = Number(dmy[2]);
    year = Number(dmy[3]);
  } else if (compact) {
    day = Number(compact[1]);
    month = Number(compact[2]);
    year = Number(compact[3]);
  } else {
    return null;
  }

  const birth = new Date(year, month - 1, day);
  if (
    Number.isNaN(birth.getTime()) ||
    birth.getFullYear() !== year ||
    birth.getMonth() !== month - 1 ||
    birth.getDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

export function ageFromDateOfBirth(raw: string, now = new Date()): number | null {
  const parsed = parseDateOfBirth(raw);
  if (!parsed) return null;

  const birth = new Date(parsed.year, parsed.month - 1, parsed.day);
  if (birth > now) return null;

  let age = now.getFullYear() - parsed.year;
  const monthDiff = now.getMonth() - (parsed.month - 1);
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < parsed.day)) {
    age -= 1;
  }
  if (age < 0 || age > 120) return null;
  return age;
}

export function toIsoDateOfBirth(raw: string): string {
  const parsed = parseDateOfBirth(raw);
  if (!parsed) return "";
  return `${parsed.year}-${String(parsed.month).padStart(2, "0")}-${String(parsed.day).padStart(2, "0")}`;
}

export function datePartsFromIso(raw: string): { day: string; month: string; year: string } {
  const parsed = parseDateOfBirth(raw);
  if (!parsed) return { day: "", month: "", year: "" };
  return {
    day: String(parsed.day),
    month: String(parsed.month),
    year: String(parsed.year),
  };
}

export function dateBoundsForAdults(now = new Date()) {
  return {
    min: toIsoDate(new Date(now.getFullYear() - 99, now.getMonth(), now.getDate())),
    max: toIsoDate(new Date(now.getFullYear() - 18, now.getMonth(), now.getDate())),
  };
}

export function hasUsablePhone(phone: string): boolean {
  return phone.replace(/\D/g, "").length >= 5;
}
