import { NextResponse } from "next/server";
import { findOrCreateOAuthProfile, setSessionCookie } from "@/lib/auth";
import { patientHasCompletedIntake } from "@/lib/cases-repo";
import { ready } from "@/lib/ensure-db";

export const runtime = "nodejs";

type GoogleUserInfo = {
  email?: string;
  email_verified?: boolean | string;
  given_name?: string;
  family_name?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accessToken?: string };
    const accessToken = body.accessToken?.trim();
    if (!accessToken) {
      return NextResponse.json({ error: "Google sign-in was cancelled." }, { status: 400 });
    }

    const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!googleRes.ok) {
      return NextResponse.json({ error: "Could not verify the Google account." }, { status: 401 });
    }
    const profile = (await googleRes.json()) as GoogleUserInfo;
    const verified = profile.email_verified === true || profile.email_verified === "true";
    if (!profile.email || !verified) {
      return NextResponse.json({ error: "Google did not return a verified email." }, { status: 400 });
    }

    await ready();
    const user = await findOrCreateOAuthProfile({
      email: profile.email,
      firstName: profile.given_name,
      lastName: profile.family_name,
    });
    await setSessionCookie(user.id);
    return NextResponse.json({
      ...user,
      hasCase: await patientHasCompletedIntake(user.id),
    });
  } catch (error) {
    console.error(error);
    const raw = error instanceof Error ? error.message : "";
    const missingDb = /ECONNREFUSED|127\.0\.0\.1|NO_DATABASE/i.test(raw);
    return NextResponse.json(
      {
        error: missingDb
          ? "Could not save your account. The live database is not connected yet."
          : "Could not sign in with Google.",
      },
      { status: 500 },
    );
  }
}
