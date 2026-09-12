import { NextResponse } from "next/server";
import { isValidEmail, normalizeEmail, setSessionCookie, verifyPassword } from "@/lib/auth";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = normalizeEmail(body.email ?? "");
    const password = body.password ?? "";
    if (!isValidEmail(email) || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const [row] = await sql<{
      id: string;
      email: string | null;
      first_name: string | null;
      last_name: string | null;
      password_hash: string | null;
      is_active: boolean;
    }[]>`
      select id, email, first_name, last_name, password_hash, is_active
      from public.profiles
      where lower(email) = ${email}
      limit 1
    `;
    if (!row?.password_hash || !row.is_active || !verifyPassword(password, row.password_hash)) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    await setSessionCookie(row.id);
    return NextResponse.json({
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not sign in." }, { status: 500 });
  }
}
