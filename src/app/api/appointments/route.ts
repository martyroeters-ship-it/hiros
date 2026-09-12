import { NextResponse } from "next/server";
import { createAppointment, listAppointments } from "@/lib/appointments-repo";
import type { AppointmentActor } from "@/app/doctor/agenda/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const caseId = new URL(request.url).searchParams.get("caseId") ?? undefined;
    const appointments = await listAppointments(caseId);
    return NextResponse.json(appointments);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load appointments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      caseId?: string;
      startsAt?: string;
      durationMinutes?: number;
      reason?: string;
      requestedBy?: AppointmentActor;
    };
    if (!body.caseId || !body.startsAt) {
      return NextResponse.json({ error: "Patient and start time are required" }, { status: 400 });
    }
    const created = await createAppointment({
      caseId: body.caseId,
      startsAt: body.startsAt,
      durationMinutes: body.durationMinutes,
      reason: body.reason,
      requestedBy: body.requestedBy === "doctor" ? "doctor" : "patient",
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Could not create appointment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
