import { NextResponse } from "next/server";
import { getSessionUser, isValidEmail, normalizeEmail } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ageFromDateOfBirth } from "@/lib/age";
import { ready } from "@/lib/ensure-db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await ready();
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const body = (await request.json()) as {
      firstName?: string;
      lastName?: string;
      dateOfBirth?: string;
      email?: string;
      phone?: string;
    };
    const firstName = body.firstName?.trim() ?? "";
    const lastName = body.lastName?.trim() ?? "";
    const dateOfBirth = body.dateOfBirth?.trim() ?? "";
    const age = ageFromDateOfBirth(dateOfBirth);
    if (!firstName || !lastName || age === null || age < 18) {
      return NextResponse.json({ error: "invalid_profile" }, { status: 400 });
    }

    const email = body.email?.trim() ? normalizeEmail(body.email) : user.email;
    if (email && !isValidEmail(email)) {
      return NextResponse.json({ error: "invalid_profile" }, { status: 400 });
    }
    const phone = body.phone?.trim() || user.phone;

    await sql`
      update public.profiles
      set
        first_name = ${firstName},
        last_name = ${lastName},
        email = coalesce(${email || null}, email),
        phone = coalesce(${phone || null}, phone)
      where id = ${user.id}::uuid
    `;

    return NextResponse.json({ ok: true, email: email || user.email, phone });
  } catch (error) {
    console.error("[auth] complete-profile", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "send_failed" }, { status: 500 });
  }
}
