import { NextResponse } from "next/server";
import { getDoctorNow } from "@/lib/now-repo";

export const runtime = "nodejs";

export async function GET() {
  try {
    const items = await getDoctorNow();
    return NextResponse.json(items);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load now queue" }, { status: 500 });
  }
}
