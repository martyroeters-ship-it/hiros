"use client";

import { Suspense, useState } from "react";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { useHomeCopy, useIntakeCopy } from "@/i18n/LanguageProvider";
import { displayName, useSessionUser } from "@/lib/use-session-user";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { copy } = useHomeCopy();
  const intake = useIntakeCopy();
  const session = useSessionUser();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [signedInEmail, setSignedInEmail] = useState("");

  const nextPath = searchParams.get("next") || "";
  const safeNext = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "";
  const activeEmail = signedInEmail || session?.email || "";

  const afterAuth = (created: boolean) => {
    if (safeNext) {
      router.push(safeNext);
      return;
    }
    router.push(created ? "/intake?condition=hair-loss" : "/dashboard");
  };

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed || !password) {
      setError(intake.auth.requiredFields);
      return;
    }
    if (password.length < 8) {
      setError(intake.auth.passwordTooShort);
      return;
    }
    if (mode === "signup" && password !== confirm) {
      setError(intake.auth.passwordMismatch);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(mode === "signup" ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, password }),
      });
      const payload = (await res.json().catch(() => ({}))) as { error?: string; email?: string };
      if (!res.ok) {
        setError(payload.error || (mode === "signup" ? "Could not create account." : "Could not sign in."));
        return;
      }
      setSignedInEmail(payload.email || trimmed);
      afterAuth(mode === "signup");
    } catch {
      setError(mode === "signup" ? "Could not create account." : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSignedInEmail("");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#fbfaf5] text-[#11110f]">
      <Header />
      <main className="mx-auto flex w-full max-w-[520px] flex-col px-5 pb-16 pt-10 sm:pt-16">
        <h1 className="text-center font-title text-[28px] font-medium leading-[1.1] tracking-[-0.04em] text-[#2b2a28] sm:text-[40px] sm:tracking-[-0.06em]">
          {activeEmail ? copy.authPage.signedIn : mode === "signup" ? copy.authPage.createTitle : copy.authPage.title}
        </h1>
        <p className="mx-auto mt-3 max-w-[38ch] text-center text-[15px] font-medium leading-[1.45] text-black/52">
          {activeEmail
            ? displayName(session) || activeEmail
            : mode === "signup"
              ? copy.authPage.createSubtitle
              : copy.authPage.subtitle}
        </p>

        {session === undefined && !signedInEmail ? (
          <div className="mx-auto mt-8 h-12 w-full max-w-[430px]" />
        ) : activeEmail ? (
          <div className="mx-auto mt-8 flex w-full max-w-[430px] flex-col gap-3">
            <p className="text-center text-[14px] font-medium text-black/55">{activeEmail}</p>
            <a
              href="/dashboard"
              className="flex min-h-[48px] items-center justify-center rounded-full bg-[#2f5f4f] px-5 text-[15px] font-semibold text-white"
            >
              {copy.authPage.goToDashboard}
            </a>
            <a
              href="/intake?condition=hair-loss"
              className="flex min-h-[48px] items-center justify-center rounded-full border border-black/10 bg-white px-5 text-[15px] font-semibold text-[#2b2a28]"
            >
              {copy.authPage.startIntake}
            </a>
            <button
              type="button"
              onClick={() => void signOut()}
              className="w-full text-center text-[13.5px] font-semibold text-[#3f5f35]"
            >
              {copy.authPage.signOut}
            </button>
          </div>
        ) : (
          <form
            className="mx-auto mt-8 flex w-full max-w-[430px] flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
          >
            <label className="block text-[13px] font-semibold text-[#2b2a28]">
              {intake.auth.emailLabel}
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1.5 h-12 w-full rounded-[14px] border border-black/10 bg-white px-4 text-[15px] font-medium outline-none focus:border-[#8ea57a]"
              />
            </label>
            <label className="block text-[13px] font-semibold text-[#2b2a28]">
              {intake.auth.passwordLabel}
              <input
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1.5 h-12 w-full rounded-[14px] border border-black/10 bg-white px-4 text-[15px] font-medium outline-none focus:border-[#8ea57a]"
              />
            </label>
            {mode === "signup" ? (
              <label className="block text-[13px] font-semibold text-[#2b2a28]">
                {intake.auth.confirmLabel}
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  className="mt-1.5 h-12 w-full rounded-[14px] border border-black/10 bg-white px-4 text-[15px] font-medium outline-none focus:border-[#8ea57a]"
                />
              </label>
            ) : null}
            {error ? <p className="text-[13px] font-medium text-[#a81d12]">{error}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#2f5f4f] px-5 text-[15px] font-semibold text-white disabled:opacity-50"
            >
              {busy ? "…" : mode === "signup" ? intake.auth.createAccount : intake.auth.signIn}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signup" ? "login" : "signup");
                setError("");
              }}
              className="w-full text-center text-[13.5px] font-semibold text-[#3f5f35]"
            >
              {mode === "signup" ? intake.auth.haveAccount : intake.auth.needAccount}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Script src="https://google.com" strategy="afterInteractive" />
      <Suspense fallback={<div className="min-h-screen bg-[#fbfaf5]" />}>
        <LoginForm />
      </Suspense>
    </>
  );
}
