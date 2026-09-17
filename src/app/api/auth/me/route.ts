import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { patientHasCompletedIntake } from "@/lib/cases-repo";
import { ready } from "@/lib/ensure-db";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  await ready();
  const hasCase = await patientHasCompletedIntake(user.id);
  return NextResponse.json({ ...user, hasCase });
}
