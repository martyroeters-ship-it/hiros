import { NextResponse } from "next/server";
import { getConversation, markConversationRead } from "@/lib/patients-repo";
import { requireStaff } from "@/lib/staff-auth";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ caseId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { caseId } = await context.params;
  try {
    const { error } = await requireStaff();
    if (error) return error;
    const thread = await getConversation(caseId);
    if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(thread);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load conversation" }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { caseId } = await context.params;
  try {
    const { error } = await requireStaff();
    if (error) return error;
    const body = (await request.json().catch(() => ({}))) as { read?: boolean };
    if (!body.read) {
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }
    const changed = await markConversationRead(caseId);
    return NextResponse.json({ ok: true, changed });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not mark conversation read" }, { status: 500 });
  }
}
