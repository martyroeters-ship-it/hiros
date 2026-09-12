import { NextResponse } from "next/server";
import { getConversation } from "@/lib/patients-repo";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ caseId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { caseId } = await context.params;
  try {
    const thread = await getConversation(caseId);
    if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(thread);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load conversation" }, { status: 500 });
  }
}
