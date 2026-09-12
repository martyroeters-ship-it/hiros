import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { listCases, persistIntake, type IntakePersistInput } from "@/lib/cases-repo";

export const runtime = "nodejs";

export async function GET() {
  try {
    const cases = await listCases();
    return NextResponse.json(cases);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load cases" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IntakePersistInput;
    if (!body?.answers || typeof body.answers !== "object") {
      return NextResponse.json({ error: "Invalid intake" }, { status: 400 });
    }
    const session = await getSessionUser();
    const created = await persistIntake(
      {
        answers: body.answers,
        followUpText: body.followUpText ?? {},
        treatmentSelections: body.treatmentSelections ?? {},
        treatmentOtherDetail: body.treatmentOtherDetail ?? "",
        sideEffectsLevel: body.sideEffectsLevel ?? null,
        city: body.city ?? null,
        firstName: body.firstName ?? "Patient",
        photos: Array.isArray(body.photos) ? body.photos : [],
        lastName: body.lastName,
        postalCode: body.postalCode,
        phone: body.phone,
        province: body.province,
      },
      session?.id,
    );
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Could not save case";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
