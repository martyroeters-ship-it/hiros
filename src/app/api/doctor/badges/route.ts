import { NextResponse } from "next/server";
import { getDoctorNavBadges } from "@/lib/nav-badges";

export const runtime = "nodejs";

export async function GET() {
  try {
    const badges = await getDoctorNavBadges();
    return NextResponse.json(badges);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ now: 0, cases: 0, agenda: 0, messages: 0 }, { status: 200 });
  }
}
