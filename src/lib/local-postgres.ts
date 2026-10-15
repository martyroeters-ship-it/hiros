import { spawn } from "node:child_process";
import { connect } from "node:net";
import path from "node:path";
import { databaseUrl } from "@/lib/db";

const fallbackUrl = "postgres://hiros:hiros@127.0.0.1:5432/hiros";

const globalForPg = globalThis as typeof globalThis & {
  hirosEmbeddedPgStart?: Promise<void>;
};

function localPort(): number | null {
  if (process.env.VERCEL) return null;
  const url = databaseUrl || fallbackUrl;
  if (!/localhost|127\.0\.0\.1/.test(url)) return null;
  try {
    return Number(new URL(url).port || 5432);
  } catch {
    return 5432;
  }
}

function portOpen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect({ host: "127.0.0.1", port });
    const done = (open: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(open);
    };
    socket.setTimeout(400);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });
}

function waitForPort(port: number): Promise<void> {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      void portOpen(port).then((open) => {
        if (open) {
          resolve();
          return;
        }
        if (Date.now() - started > 30000) {
          reject(new Error("Local database did not start."));
          return;
        }
        setTimeout(tick, 300);
      });
    };
    tick();
  });
}

/** Start the local Postgres used by this project when nothing is listening. */
export async function ensureLocalPostgres(): Promise<void> {
  const port = localPort();
  if (port === null) return;
  if (await portOpen(port)) return;
  if (!globalForPg.hirosEmbeddedPgStart) {
    globalForPg.hirosEmbeddedPgStart = (async () => {
      if (await portOpen(port)) return;
      const child = spawn(process.execPath, [path.join(process.cwd(), "scripts/db-up.mjs")], {
        cwd: process.cwd(),
        detached: true,
        stdio: "ignore",
      });
      child.unref();
      await waitForPort(port);
    })().catch((error) => {
      globalForPg.hirosEmbeddedPgStart = undefined;
      throw error;
    });
  }
  await globalForPg.hirosEmbeddedPgStart;
}
