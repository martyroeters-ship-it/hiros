import { NextResponse } from "next/server";
import { listTreatmentPatients } from "@/lib/patients-repo";
import { requireStaff } from "@/lib/staff-auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { error } = await requireStaff();
    if (error) return error;
    const patients = await listTreatmentPatients();
    return NextResponse.json(patients);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load patients" }, { status: 500 });
  }
}
