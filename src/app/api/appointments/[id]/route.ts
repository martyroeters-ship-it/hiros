import { NextResponse } from "next/server";
import { getAppointment, updateAppointment } from "@/lib/appointments-repo";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const appointment = await getAppointment(id);
    if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(appointment);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load appointment" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const body = (await request.json()) as { action?: "confirm" | "cancel" | "complete" | "note"; notes?: string };
    if (
      body.action !== "confirm" &&
      body.action !== "cancel" &&
      body.action !== "complete" &&
      body.action !== "note"
    ) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    const updated = await updateAppointment(id, body.action, body.notes);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Could not update appointment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
