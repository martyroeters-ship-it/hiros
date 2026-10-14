import { NextResponse } from "next/server";
import { issueLoginCode, parseLoginIdentifier } from "@/lib/login-code";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { identifier?: string };
    const parsed = parseLoginIdentifier(body.identifier ?? "");
    if (!parsed) {
      return NextResponse.json({ error: "invalid_identifier" }, { status: 400 });
    }

    const code = issueLoginCode(parsed.key);
    if (process.env.NODE_ENV !== "production") {
      console.info(`[auth] confirmation code for ${parsed.display}: ${code}`);
    }

    return NextResponse.json({
      display: parsed.display,
      channel: parsed.channel,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "send_failed" }, { status: 500 });
  }
}
