import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import EmbeddedPostgres from "embedded-postgres";
import postgres from "postgres";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databaseDir = path.join(root, ".pgdata");
const port = Number(process.env.HIROS_PG_PORT ?? 5432);

const cluster = new EmbeddedPostgres({
  databaseDir,
  user: "hiros",
  password: "hiros",
  port,
  persistent: true,
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});

if (!existsSync(path.join(databaseDir, "PG_VERSION"))) {
  await cluster.initialise();
}
await cluster.start();

try {
  await cluster.createDatabase("hiros");
} catch {
  // Exists from a previous start.
}

const sql = postgres({
  host: "127.0.0.1",
  port,
  database: "hiros",
  username: "hiros",
  password: "hiros",
  max: 1,
});

const [{ cases }] = await sql`
  select to_regclass('public.cases') as cases
`;

if (!cases) {
  const migration = await readFile(path.join(root, "db/migrations/001_init.sql"), "utf8");
  await sql.unsafe(migration, [], { simple: true });
  console.log("Applied schema.");
} else {
  console.log("Schema already present.");
}

const [{ treatments }] = await sql`
  select to_regclass('public.case_treatments') as treatments
`;
if (!treatments) {
  const followup = await readFile(path.join(root, "db/migrations/002_treatment_followup.sql"), "utf8");
  await sql.unsafe(followup, [], { simple: true });
  console.log("Applied treatment follow-up schema.");
}

const [{ appointments }] = await sql`
  select to_regclass('public.video_appointments') as appointments
`;
if (!appointments) {
  const video = await readFile(path.join(root, "db/migrations/003_video_appointments.sql"), "utf8");
  await sql.unsafe(video, [], { simple: true });
  console.log("Applied video appointments schema.");
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
  const auth = await readFile(path.join(root, "db/migrations/004_auth.sql"), "utf8");
  await sql.unsafe(auth, [], { simple: true });
  console.log("Applied auth schema.");
}

const seed = await readFile(path.join(root, "db/seed/001_demo.sql"), "utf8");
await sql.unsafe(seed, [], { simple: true });
const treatmentSeed = await readFile(path.join(root, "db/seed/002_treatment_patients.sql"), "utf8");
await sql.unsafe(treatmentSeed, [], { simple: true });
const appointmentSeed = await readFile(path.join(root, "db/seed/003_appointments.sql"), "utf8");
await sql.unsafe(appointmentSeed, [], { simple: true });
const messageSeed = await readFile(path.join(root, "db/seed/004_messages.sql"), "utf8");
await sql.unsafe(messageSeed, [], { simple: true });

const [counts] = await sql`
  select
    (select count(*)::int from public.doctors where is_demo) as demo_doctors,
    (select count(*)::int from public.clinics where is_demo) as demo_clinics,
    (select full_name from public.doctors where is_demo limit 1) as doctor_name
`;

await sql.end({ timeout: 1 });

console.log("Demo clinic:", counts.demo_clinics, "demo doctor:", counts.demo_doctors, counts.doctor_name);
console.log(`Owner: postgres://hiros:hiros@127.0.0.1:${port}/hiros`);
console.log(`App:   postgres://hiros_app:hiros_app_login@127.0.0.1:${port}/hiros`);
console.log("Postgres is running. Keep this process open.");

await new Promise(() => {});
