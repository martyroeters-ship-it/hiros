import { getSessionUser } from "@/lib/auth";
import { ready } from "@/lib/ensure-db";
import { sql } from "@/lib/db";
import {
  isLifestyleArea,
  scoreLifestyle,
  type LifestyleArea,
  type LifestyleStatus,
} from "@/data/lifestyleCheckIn";

export type CareLifestyleSnapshot = {
  signedIn: boolean;
  reportedStress: boolean;
  nutrition: LifestyleStatus | null;
  sleep: LifestyleStatus | null;
};

export async function getCareLifestyleSnapshot(): Promise<CareLifestyleSnapshot> {
  await ready();
  const user = await getSessionUser();
  if (!user) {
    return { signedIn: false, reportedStress: false, nutrition: null, sleep: null };
  }

  const [caseRow] = await sql<{ id: string }[]>`
    select id
    from public.cases
    where patient_id = ${user.id}::uuid
    order by created_at desc
    limit 1
  `;

  let reportedStress = false;
  if (caseRow) {
    const [change] = await sql<{ answer: string }[]>`
      select answer
      from public.case_answers
      where case_id = ${caseRow.id}::uuid
        and step_id = 'recent-changes'
      limit 1
    `;
    reportedStress = (change?.answer ?? "").trim() === "Major stress";
  }

  const rows = await sql<{ area: string; status: string }[]>`
    select area, status
    from public.care_lifestyle_checkins
    where user_id = ${user.id}::uuid
  `;

  const nutrition = rows.find((row) => row.area === "nutrition")?.status;
  const sleep = rows.find((row) => row.area === "sleep")?.status;

  return {
    signedIn: true,
    reportedStress,
    nutrition: nutrition === "on_track" || nutrition === "needs_attention" ? nutrition : null,
    sleep: sleep === "on_track" || sleep === "needs_attention" ? sleep : null,
  };
}

export async function saveCareLifestyleCheckIn(area: string, answers: Record<string, string>) {
  await ready();
  const user = await getSessionUser();
  if (!user) throw new Error("Sign in to save this check-in");
  if (!isLifestyleArea(area)) throw new Error("Unknown check-in");

  const status = scoreLifestyle(area, answers);
  await sql`
    insert into public.care_lifestyle_checkins (user_id, area, answers, status, completed_at)
    values (${user.id}::uuid, ${area}, ${sql.json(answers)}, ${status}, now())
    on conflict (user_id, area)
    do update set
      answers = excluded.answers,
      status = excluded.status,
      completed_at = excluded.completed_at
  `;

  return { area, status } as { area: LifestyleArea; status: LifestyleStatus };
}

export async function clearCareLifestyleCheckIns() {
  await ready();
  const user = await getSessionUser();
  if (!user) throw new Error("Sign in to reset this check-in");
  const deleted = await sql`
    delete from public.care_lifestyle_checkins
    where user_id = ${user.id}::uuid
    returning area
  `;
  return { cleared: deleted.map((row) => row.area) };
}
