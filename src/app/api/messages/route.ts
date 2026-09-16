import { NextResponse } from "next/server";
import { listConversations, messagePatient } from "@/lib/patients-repo";
import { requireStaff } from "@/lib/staff-auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { error } = await requireStaff();
    if (error) return error;
    const conversations = await listConversations();
    return NextResponse.json(conversations);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { caseId?: string; body?: string };
    if (!body.caseId || !body.body?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    const { error } = await requireStaff();
    if (error) return error;
    const updated = await messagePatient(body.caseId, body.body);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Could not send message";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
