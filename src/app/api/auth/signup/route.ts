import { NextResponse } from "next/server";
import { hashPassword, isValidEmail, normalizeEmail, setSessionCookie } from "@/lib/auth";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string; firstName?: string; lastName?: string };
    const email = normalizeEmail(body.email ?? "");
    const password = body.password ?? "";
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const [existing] = await sql<{ id: string }[]>`
      select id from public.profiles where lower(email) = ${email} limit 1
    `;
    if (existing) {
      return NextResponse.json({ error: "An account already exists. Sign in instead." }, { status: 409 });
    }

    const [created] = await sql<{ id: string; email: string | null; first_name: string | null; last_name: string | null }[]>`
      insert into public.profiles (role, email, password_hash, first_name, last_name, locale)
      values (
        'patient',
        ${email},
        ${hashPassword(password)},
        ${body.firstName?.trim() || null},
        ${body.lastName?.trim() || null},
        'tr'
      )
      returning id, email, first_name, last_name
    `;
    if (!created?.id) {
      return NextResponse.json({ error: "Could not create account." }, { status: 500 });
    }

    await setSessionCookie(created.id);
    return NextResponse.json({
      id: created.id,
      email: created.email,
      firstName: created.first_name,
      lastName: created.last_name,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }
}
