import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { photoFilePath } from "@/lib/cases-repo";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ caseId: string; filename: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { caseId, filename } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(caseId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const filePath = photoFilePath(caseId, filename);
  try {
    const bytes = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const type = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    return new NextResponse(bytes, {
      headers: { "Content-Type": type, "Cache-Control": "private, max-age=3600" },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
