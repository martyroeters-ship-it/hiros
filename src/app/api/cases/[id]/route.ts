import { NextResponse } from "next/server";
import { getCase, updateCaseTab } from "@/lib/cases-repo";
import type { TabKey } from "@/app/doctor/data";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const item = await getCase(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load case" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const body = (await request.json()) as {
      tab?: TabKey;
      treatmentType?: string;
      followUp?: string;
      note?: string;
    };
    if (body.tab !== "approved" && body.tab !== "declined" && body.tab !== "pending") {
      return NextResponse.json({ error: "Invalid tab" }, { status: 400 });
    }
    const updated = await updateCaseTab(id, body.tab, {
      treatmentType: body.treatmentType,
      followUp: body.followUp,
      note: body.note,
    });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not update case" }, { status: 500 });
  }
}
