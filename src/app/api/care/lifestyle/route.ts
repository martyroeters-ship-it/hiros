import { NextResponse } from "next/server";
import { clearCareLifestyleCheckIns, getCareLifestyleSnapshot, saveCareLifestyleCheckIn } from "@/lib/care-lifestyle";

export const runtime = "nodejs";

export async function GET() {
  try {
    const snapshot = await getCareLifestyleSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load check-in" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { area?: string; answers?: Record<string, string> };
    const result = await saveCareLifestyleCheckIn(body.area ?? "", body.answers ?? {});
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save check-in";
    const status = message.includes("Sign in") ? 401 : 400;
    console.error(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE() {
  try {
    const result = await clearCareLifestyleCheckIns();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reset check-in";
    const status = message.includes("Sign in") ? 401 : 400;
    console.error(error);
    return NextResponse.json({ error: message }, { status });
  }
}
