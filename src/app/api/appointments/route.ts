import { NextResponse } from "next/server";
import { createAppointment, listAppointments } from "@/lib/appointments-repo";
import type { AppointmentActor } from "@/app/doctor/agenda/types";
import { getSessionUser, isStaffRole } from "@/lib/auth";
import { userOwnsCase } from "@/lib/staff-auth";
import { ready } from "@/lib/ensure-db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await ready();
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Sign-in required." }, { status: 401 });
    }
    const caseId = new URL(request.url).searchParams.get("caseId") ?? undefined;
    if (!isStaffRole(user.role)) {
      if (!caseId || !(await userOwnsCase(user.id, caseId))) {
        return NextResponse.json({ error: "Not allowed." }, { status: 403 });
      }
    }
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
    await ready();
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Sign-in required." }, { status: 401 });
    }
    const asDoctor = body.requestedBy === "doctor";
    if (asDoctor && !isStaffRole(user.role)) {
      return NextResponse.json({ error: "Physician sign-in required." }, { status: 401 });
    }
    if (!asDoctor && !isStaffRole(user.role) && !(await userOwnsCase(user.id, body.caseId))) {
      return NextResponse.json({ error: "Not allowed." }, { status: 403 });
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
