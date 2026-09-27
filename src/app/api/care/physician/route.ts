import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { assignPreferredPhysician } from "@/lib/cases-repo";
import { ready } from "@/lib/ensure-db";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    await ready();
    const session = await getSessionUser();
    if (!session?.id) {
      return NextResponse.json({ error: "Sign in to change your physician." }, { status: 401 });
    }
    const body = (await request.json()) as { doctorId?: string };
    if (!body.doctorId) {
      return NextResponse.json({ error: "Choose a physician." }, { status: 400 });
    }
    await assignPreferredPhysician(session.id, body.doctorId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Could not change physician";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
