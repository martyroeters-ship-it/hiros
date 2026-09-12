import { NextResponse } from "next/server";
import { findOrCreateOAuthProfile, setSessionCookie } from "@/lib/auth";

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

    const user = await findOrCreateOAuthProfile({
      email: profile.email,
      firstName: profile.given_name,
      lastName: profile.family_name,
    });
    await setSessionCookie(user.id);
    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Could not sign in with Google.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
