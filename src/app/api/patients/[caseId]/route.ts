import { NextResponse } from "next/server";
import {
  adjustTreatment,
  getTreatmentPatient,
  markPrescriptionFilled,
  messagePatient,
  scheduleFollowUp,
} from "@/lib/patients-repo";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ caseId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { caseId } = await context.params;
  try {
    const patient = await getTreatmentPatient(caseId);
    if (!patient) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(patient);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load patient" }, { status: 500 });
  }
}

type PatchBody = {
  action?: "mark_filled" | "adjust_treatment" | "schedule_followup" | "message";
  treatmentName?: string;
  notes?: string;
  followUpAt?: string;
  body?: string;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { caseId } = await context.params;
  try {
    const body = (await request.json()) as PatchBody;
    let updated = null;
    if (body.action === "mark_filled") {
      updated = await markPrescriptionFilled(caseId, body.notes);
    } else if (body.action === "adjust_treatment") {
      if (!body.treatmentName?.trim()) {
        return NextResponse.json({ error: "Treatment name is required" }, { status: 400 });
      }
      updated = await adjustTreatment(caseId, body.treatmentName, body.notes);
    } else if (body.action === "schedule_followup") {
      if (!body.followUpAt) {
        return NextResponse.json({ error: "Follow-up date is required" }, { status: 400 });
      }
      updated = await scheduleFollowUp(caseId, body.followUpAt);
    } else if (body.action === "message") {
      if (!body.body?.trim()) {
        return NextResponse.json({ error: "Message is required" }, { status: 400 });
      }
      updated = await messagePatient(caseId, body.body);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Could not update patient";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
