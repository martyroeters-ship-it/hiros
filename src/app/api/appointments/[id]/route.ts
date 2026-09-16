import { NextResponse } from "next/server";
import { getAppointment, updateAppointment } from "@/lib/appointments-repo";
import { getSessionUser, isStaffRole } from "@/lib/auth";
import { ready } from "@/lib/ensure-db";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    await ready();
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Sign-in required." }, { status: 401 });
    }
    const appointment = await getAppointment(id);
    if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!isStaffRole(user.role) && appointment.patientId !== user.id) {
      return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    }
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
    await ready();
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Sign-in required." }, { status: 401 });
    }
    const existing = await getAppointment(id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!isStaffRole(user.role) && existing.patientId !== user.id) {
      return NextResponse.json({ error: "Not allowed." }, { status: 403 });
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
