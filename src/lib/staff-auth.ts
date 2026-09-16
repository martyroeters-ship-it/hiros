import { NextResponse } from "next/server";
import { getSessionUser, isStaffRole, type SessionUser } from "./auth";
import { sql } from "./db";
import { ready } from "./ensure-db";

export async function requireStaff(): Promise<
  { user: SessionUser; error: null } | { user: null; error: NextResponse }
> {
  await ready();
  const user = await getSessionUser();
  if (!user || !isStaffRole(user.role)) {
    return {
      user: null,
      error: NextResponse.json({ error: "Physician sign-in required." }, { status: 401 }),
    };
  }
  return { user, error: null };
}

export async function userOwnsCase(profileId: string, caseId: string): Promise<boolean> {
  if (!/^[0-9a-f-]{36}$/i.test(caseId) || !/^[0-9a-f-]{36}$/i.test(profileId)) {
    return false;
  }
  const [row] = await sql<{ ok: boolean }[]>`
    select exists (
      select 1
      from public.cases
      where id = ${caseId}::uuid
        and patient_id = ${profileId}::uuid
    ) as ok
  `;
  return Boolean(row?.ok);
}

export async function requireStaffOrCaseOwner(caseId: string): Promise<
  { user: SessionUser; error: null } | { user: null; error: NextResponse }
> {
  await ready();
  const user = await getSessionUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Sign-in required." }, { status: 401 }),
    };
  }
  if (isStaffRole(user.role) || (await userOwnsCase(user.id, caseId))) {
    return { user, error: null };
  }
  return {
    user: null,
    error: NextResponse.json({ error: "Not allowed." }, { status: 403 }),
  };
}
