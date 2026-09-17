import { NextResponse } from "next/server";
import { getDoctorNow } from "@/lib/now-repo";
import { requireStaff } from "@/lib/staff-auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { error } = await requireStaff();
    if (error) return error;
    const items = await getDoctorNow();
    return NextResponse.json(items);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load now queue" }, { status: 500 });
  }
}
