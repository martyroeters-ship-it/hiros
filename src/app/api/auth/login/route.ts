import { NextResponse } from "next/server";
import { isValidEmail, normalizeEmail, setSessionCookie, verifyPassword } from "@/lib/auth";
import { patientHasCompletedIntake } from "@/lib/cases-repo";
import { sql } from "@/lib/db";
import { ready } from "@/lib/ensure-db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = normalizeEmail(body.email ?? "");
    const password = body.password ?? "";
    if (!isValidEmail(email) || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    await ready();
    const [row] = await sql<{
      id: string;
      email: string | null;
      first_name: string | null;
      last_name: string | null;
      password_hash: string | null;
      is_active: boolean;
      role: string;
    }[]>`
      select id, email, first_name, last_name, password_hash, is_active, role
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
      role: row.role,
      hasCase: await patientHasCompletedIntake(row.id),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not sign in." }, { status: 500 });
  }
}
