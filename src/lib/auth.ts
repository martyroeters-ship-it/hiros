import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { sql } from "./db";

export const SESSION_COOKIE = "hiros_session";
const SESSION_DAYS = 30;

export type SessionUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  city: string | null;
  postalCode: string | null;
  role: string;
};

function sessionSecret(): string {
  return process.env.SESSION_SECRET || "hiros-demo-session-secret";
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 64);
  const prev = Buffer.from(hash, "hex");
  if (prev.length !== next.length) return false;
  return timingSafeEqual(prev, next);
}

function sign(value: string): string {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export function createSessionToken(profileId: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      id: profileId,
      exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string): string | null {
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;
  const expected = sign(payload);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { id?: string; exp?: number };
    if (!data.id || !data.exp || data.exp < Date.now()) return null;
    return data.id;
  } catch {
    return null;
  }
}

export async function setSessionCookie(profileId: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSessionToken(profileId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const id = readSessionToken(token);
  if (!id) return null;

  const [row] = await sql<
    {
      id: string;
      email: string | null;
      first_name: string | null;
      last_name: string | null;
      phone: string | null;
      il: string | null;
      postal_code: string | null;
      role: string;
      is_active: boolean;
    }[]
  >`
    select id, email, first_name, last_name, phone, il, postal_code, role, is_active
    from public.profiles
    where id = ${id}::uuid
    limit 1
  `;
  if (!row?.email || !row.is_active) return null;
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    city: row.il,
    postalCode: row.postal_code,
    role: row.role,
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function findOrCreateOAuthProfile(input: {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}) {
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) {
    throw new Error("Google did not return a valid email.");
  }

  const [existing] = await sql<{
    id: string;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    is_active: boolean;
  }[]>`
    select id, email, first_name, last_name, is_active
    from public.profiles
    where lower(email) = ${email}
    limit 1
  `;
  if (existing) {
    if (!existing.is_active) {
      throw new Error("This account is not active.");
    }
    if (input.firstName || input.lastName) {
      await sql`
        update public.profiles
        set
          first_name = coalesce(first_name, ${input.firstName?.trim() || null}),
          last_name = coalesce(last_name, ${input.lastName?.trim() || null})
        where id = ${existing.id}::uuid
      `;
    }
    return {
      id: existing.id,
      email: existing.email || email,
      firstName: existing.first_name,
      lastName: existing.last_name,
    };
  }

  const [created] = await sql<{
    id: string;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
  }[]>`
    insert into public.profiles (role, email, first_name, last_name, locale)
    values (
      'patient',
      ${email},
      ${input.firstName?.trim() || null},
      ${input.lastName?.trim() || null},
      'tr'
    )
    returning id, email, first_name, last_name
  `;
  if (!created?.id) {
    throw new Error("Could not create account.");
  }
  return {
    id: created.id,
    email: created.email || email,
    firstName: created.first_name,
    lastName: created.last_name,
  };
}
