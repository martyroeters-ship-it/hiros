import { NextResponse } from "next/server";
import { sendPatientMessage } from "@/lib/patient-dashboard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { body?: string };
    const snapshot = await sendPatientMessage(body.body ?? "");
    return NextResponse.json(snapshot);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not send message";
    const status = message.includes("Premium") ? 403 : message.includes("Sign in") ? 401 : 400;
    console.error(error);
    return NextResponse.json({ error: message }, { status });
  }
}
