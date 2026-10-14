import { NextResponse } from "next/server";
import { findOrCreateOAuthProfile, setSessionCookie } from "@/lib/auth";
import { patientHasCompletedIntake } from "@/lib/cases-repo";
import { ready } from "@/lib/ensure-db";
import { sql } from "@/lib/db";
import { clearLoginCode, parseLoginIdentifier } from "@/lib/login-code";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let parsed = parseLoginIdentifier("");
  try {
    const body = (await request.json()) as { identifier?: string; code?: string };
    parsed = parseLoginIdentifier(body.identifier ?? "");
    if (!parsed) {
      return NextResponse.json({ error: "invalid_identifier" }, { status: 400 });
    }

    const code = (body.code ?? "").trim();
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "invalid_code" }, { status: 400 });
    }
    clearLoginCode(parsed.key);

    await ready();

    if (parsed.channel === "email" && parsed.email) {
      const profile = await findOrCreateOAuthProfile({ email: parsed.email });
      await setSessionCookie(profile.id);
      clearLoginCode(parsed.key);
      return NextResponse.json({
        id: profile.id,
        email: profile.email,
        phone: null,
        firstName: profile.firstName,
        lastName: profile.lastName,
        needsProfile: !profile.firstName || !profile.lastName,
        hasCase: await patientHasCompletedIntake(profile.id),
      });
    }

    const phone = parsed.phone ?? parsed.display;
    const digits = phone.replace(/\D/g, "");
    const [existing] = await sql<{
      id: string;
      email: string | null;
      phone: string | null;
      first_name: string | null;
      last_name: string | null;
    }[]>`
      select id, email, phone, first_name, last_name
      from public.profiles
      where regexp_replace(coalesce(phone, ''), '\\D', '', 'g') = ${digits}
      limit 1
    `;

    let profileId = existing?.id;
    let email = existing?.email ?? null;
    let firstName = existing?.first_name ?? null;
    let lastName = existing?.last_name ?? null;
    if (!profileId) {
      const [created] = await sql<{ id: string; email: string | null }[]>`
        insert into public.profiles (role, phone, locale)
        values ('patient', ${phone}, 'tr')
        returning id, email
      `;
      if (!created?.id) {
        return NextResponse.json({ error: "send_failed" }, { status: 500 });
      }
      profileId = created.id;
      email = created.email;
      firstName = null;
      lastName = null;
    }

    await setSessionCookie(profileId);
    clearLoginCode(parsed.key);
    return NextResponse.json({
      id: profileId,
      email,
      phone,
      firstName,
      lastName,
      needsProfile: !firstName || !lastName,
      hasCase: await patientHasCompletedIntake(profileId),
    });
  } catch (error) {
    console.error("[auth] verify-code", error instanceof Error ? error.message : error);
    return NextResponse.json({
      error: "send_failed",
      verified: Boolean(parsed),
      needsProfile: true,
      email: parsed?.email ?? null,
      phone: parsed?.phone ?? null,
    }, { status: parsed ? 200 : 500 });
  }
}
