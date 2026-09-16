"use client";

import { useState } from "react";

export function DoctorLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed || !password) {
      setError("Email and password are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/doctor-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, password }),
      });
      const payload = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(payload.error || "Could not sign in.");
        return;
      }
      const path = window.location.pathname;
      const next = path.startsWith("/doctor") && path !== "/doctor/login" ? path : "/doctor";
      window.location.assign(next);
    } catch {
      setError("Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-10">
      <div className="pointer-events-none absolute left-[12%] top-[22%] h-40 w-40 rounded-full bg-[#7ee0ea]/50 blur-2xl" />
      <div className="pointer-events-none absolute bottom-[18%] right-[16%] h-48 w-48 rounded-full bg-[#f3c4c8]/55 blur-2xl" />

      <div className="relative w-full max-w-[400px] rounded-[28px] border border-black/[0.06] bg-white px-8 py-10 shadow-[0_24px_80px_rgba(20,24,18,0.08)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2f5f4f]">
          <span className="font-title text-[18px] font-semibold text-white">H</span>
        </div>

        <h1 className="mt-6 text-center text-[22px] font-semibold tracking-[-0.03em] text-[#1b1b1b]">
          Log in to the doctor portal
        </h1>

        <form
          className="mt-8 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <label className="block text-[13px] font-semibold text-[#1b1b1b]">
            Email
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 h-11 w-full rounded-[10px] border border-black/12 bg-white px-3.5 text-[15px] text-[#1b1b1b] outline-none transition-colors focus:border-[#2f5f4f]"
            />
          </label>
          <label className="block text-[13px] font-semibold text-[#1b1b1b]">
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 h-11 w-full rounded-[10px] border border-black/12 bg-white px-3.5 text-[15px] text-[#1b1b1b] outline-none transition-colors focus:border-[#2f5f4f]"
            />
          </label>
          {error ? <p className="text-[13px] font-medium text-[#a81d12]">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="mt-1 flex h-11 w-full items-center justify-center rounded-[10px] bg-[#2f5f4f] text-[15px] font-semibold text-white transition-colors hover:bg-[#274f42] disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <a
          href="/"
          className="mt-6 flex items-center justify-center gap-1 text-[14px] font-medium text-[#2f5f4f] hover:underline"
        >
          <span aria-hidden="true">←</span> Back
        </a>
      </div>
    </div>
  );
}
