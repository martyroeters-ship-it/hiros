import { NextResponse } from "next/server";
import { getPatientDashboardSnapshot } from "@/lib/patient-dashboard";

export const runtime = "nodejs";

export async function GET() {
  try {
    const snapshot = await getPatientDashboardSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load dashboard" }, { status: 500 });
  }
}
