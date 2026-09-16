import { NextResponse } from "next/server";
import { loadPhotoBytes } from "@/lib/cases-repo";
import { ready } from "@/lib/ensure-db";
import { requireStaffOrCaseOwner } from "@/lib/staff-auth";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ caseId: string; filename: string }> };

export async function GET(_request: Request, context: RouteContext) {
  await ready();
  const { caseId, filename } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(caseId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { error } = await requireStaffOrCaseOwner(caseId);
  if (error) return error;
  const photo = await loadPhotoBytes(caseId, filename);
  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(photo.bytes), {
    headers: { "Content-Type": photo.contentType, "Cache-Control": "private, max-age=3600" },
  });
}
