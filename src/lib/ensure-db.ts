import { readFile } from "node:fs/promises";
import path from "node:path";
import { hashPassword } from "./auth";
import { databaseUrl, sql } from "./db";

const globalForDb = globalThis as typeof globalThis & {
  hirosDbBoot?: Promise<void> | null;
};

async function applyFile(relativePath: string) {
  const sqlText = await readFile(path.join(process.cwd(), relativePath), "utf8");
  await sql.unsafe(sqlText);
}

async function applyIfNeeded() {
  const [{ cases }] = await sql`
    select to_regclass('public.cases') as cases
  `;
  if (!cases) {
    await applyFile("db/migrations/001_init.sql");
  }

  const [{ treatments }] = await sql`
    select to_regclass('public.case_treatments') as treatments
  `;
  if (!treatments) {
    await applyFile("db/migrations/002_treatment_followup.sql");
  }

  const [{ appointments }] = await sql`
    select to_regclass('public.video_appointments') as appointments
  `;
  if (!appointments) {
    await applyFile("db/migrations/003_video_appointments.sql");
  }

  const [{ has_password }] = await sql`
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'profiles'
        and column_name = 'password_hash'
    ) as has_password
  `;
  if (!has_password) {
    await applyFile("db/migrations/004_auth.sql");
  }

  const [{ has_doctor_read }] = await sql`
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'cases'
        and column_name = 'doctor_last_read_at'
    ) as has_doctor_read
  `;
  if (!has_doctor_read) {
    await applyFile("db/migrations/005_doctor_message_read.sql");
  }

  const [{ has_photo_bytes }] = await sql`
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'case_photos'
        and column_name = 'bytes'
    ) as has_photo_bytes
  `;
  if (!has_photo_bytes) {
    await applyFile("db/migrations/006_photo_bytes.sql");
  }

  const [{ has_lifestyle }] = await sql`
    select to_regclass('public.care_lifestyle_checkins') as has_lifestyle
  `;
  if (!has_lifestyle) {
    await applyFile("db/migrations/007_care_lifestyle.sql");
  }

  await applyFile("db/seed/001_demo.sql");
  await applyFile("db/seed/002_treatment_patients.sql");
  await applyFile("db/seed/003_appointments.sql");
  await applyFile("db/seed/004_messages.sql");
}

const DEMO_DOCTOR_EMAIL = "demo.hekim@hiros.local";

async function ensureDemoDoctorPassword() {
  const [row] = await sql<{ password_hash: string | null }[]>`
    select password_hash
    from public.profiles
    where lower(email) = ${DEMO_DOCTOR_EMAIL}
    limit 1
  `;
  if (!row || row.password_hash) return;
  const password = process.env.DOCTOR_DEMO_PASSWORD || "HirosDoctor1";
  await sql`
    update public.profiles
    set password_hash = ${hashPassword(password)}
    where lower(email) = ${DEMO_DOCTOR_EMAIL}
      and password_hash is null
  `;
}

export async function ready() {
  if (process.env.VERCEL && !databaseUrl) {
    throw new Error("NO_DATABASE");
  }
  if (!globalForDb.hirosDbBoot) {
    globalForDb.hirosDbBoot = applyIfNeeded().catch((error) => {
      globalForDb.hirosDbBoot = null;
      throw error;
    });
  }
  await globalForDb.hirosDbBoot;
  await ensureDemoDoctorPassword();
  await ensureDoctorReadColumn();
  await ensurePhotoBytesColumn();
  await ensureCareLifestyleTable();
}

async function ensureDoctorReadColumn() {
  const [{ has_doctor_read }] = await sql`
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'cases'
        and column_name = 'doctor_last_read_at'
    ) as has_doctor_read
  `;
  if (!has_doctor_read) {
    await applyFile("db/migrations/005_doctor_message_read.sql");
  }
}

async function ensurePhotoBytesColumn() {
  const [{ has_photo_bytes }] = await sql`
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'case_photos'
        and column_name = 'bytes'
    ) as has_photo_bytes
  `;
  if (!has_photo_bytes) {
    await applyFile("db/migrations/006_photo_bytes.sql");
  }
}

async function ensureCareLifestyleTable() {
  const [{ has_lifestyle }] = await sql`
    select to_regclass('public.care_lifestyle_checkins') as has_lifestyle
  `;
  if (!has_lifestyle) {
    await applyFile("db/migrations/007_care_lifestyle.sql");
  }
}
