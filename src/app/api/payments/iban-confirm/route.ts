import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { loadLatestCaseForPatient } from "@/lib/cases-repo";
import { ready } from "@/lib/ensure-db";
import { getPatientDashboardSnapshot } from "@/lib/patient-dashboard";
import { sql } from "@/lib/db";
import { bankTransfer } from "@/lib/bank-transfer";

export const runtime = "nodejs";

export async function POST() {
  try {
    await ready();
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Sign in to confirm payment" }, { status: 401 });
    }
    const linked = await loadLatestCaseForPatient(session.id);
    if (!linked) {
      return NextResponse.json({ error: "Finish intake first" }, { status: 400 });
    }

    await sql`
      insert into public.charges (
        case_id, patient_id, kind, amount_kurus, currency, status, provider
      ) values (
        ${linked.id}::uuid,
        ${linked.patient_id}::uuid,
        'saas_fee',
        ${bankTransfer.amountTry * 100},
        'TRY',
        'pending_approval',
        'iban'
      )
      on conflict (case_id, kind) do update set
        status = case
          when public.charges.status in ('captured', 'capturing') then public.charges.status
          else 'pending_approval'
        end,
        provider = 'iban',
        updated_at = now()
    `;

    const snapshot = await getPatientDashboardSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not confirm transfer" }, { status: 500 });
  }
}
