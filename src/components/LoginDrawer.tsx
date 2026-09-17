"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHomeCopy, useIntakeCopy } from "@/i18n/LanguageProvider";
import { signInWithGoogle } from "@/lib/google-signin";

const LoginDrawerContext = createContext<{ openLogin: () => void } | null>(null);

export function useLoginDrawer() {
  return useContext(LoginDrawerContext);
}

export function LoginDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openLogin = useCallback(() => setOpen(true), []);

  return (
    <LoginDrawerContext.Provider value={{ openLogin }}>
      {children}
      <LoginDrawer open={open} onClose={() => setOpen(false)} />
    </LoginDrawerContext.Provider>
  );
}

const CREATE_ACCOUNT_LINK =
  "inline-block bg-gradient-to-r from-[#3f5f35] via-[#6f8759] to-[#6a8255] bg-clip-text text-transparent";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.33-.18-1.95H12v3.69h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.97-4.32 2.97-7.26Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.44l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.75-5.6-4.1H3.05v2.58A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 13.92A5.98 5.98 0 0 1 6.08 12c0-.67.12-1.32.32-1.92V7.5H3.05A10 10 0 0 0 2 12c0 1.61.39 3.14 1.05 4.5l3.35-2.58Z" />
      <path fill="#EA4335" d="M12 5.98c1.47 0 2.78.5 3.82 1.48l2.87-2.87C16.95 2.97 14.7 2 12 2A10 10 0 0 0 3.05 7.5l3.35 2.58c.79-2.35 3-4.1 5.6-4.1Z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M16.63 12.57c-.03-3.12 2.54-4.62 2.66-4.7-1.46-2.13-3.72-2.42-4.52-2.46-1.92-.2-3.75 1.13-4.73 1.13-1 0-2.5-1.1-4.12-1.07-2.1.03-4.07 1.23-5.15 3.12-2.22 3.84-.56 9.48 1.56 12.56 1.06 1.5 2.3 3.17 3.93 3.11 1.59-.06 2.18-1 4.1-1 1.9 0 2.45 1 4.12.96 1.7-.03 2.78-1.52 3.8-3.03 1.23-1.72 1.72-3.43 1.74-3.52-.04-.01-3.33-1.28-3.36-5.1ZM13.5 3.33c.84-1.02 1.42-2.4 1.26-3.8-1.22.05-2.75.84-3.63 1.84-.78.9-1.48 2.3-1.3 3.64 1.37.1 2.78-.69 3.67-1.68Z" />
    </svg>
  );
}

export function LoginDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { copy } = useHomeCopy();
  const intake = useIntakeCopy();
  const drawer = copy.loginDrawer;
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [forgotNotice, setForgotNotice] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setMode("login");
    setError("");
    setForgotNotice(false);
  }, [open]);

  const passwordTooShortLive = mode === "signup" && password.length > 0 && password.length < 8;

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
      const payload = (await res.json().catch(() => ({}))) as { error?: string; hasCase?: boolean };
      if (!res.ok) {
        setError(payload.error || (mode === "signup" ? "Could not create account." : "Could not sign in."));
        return;
      }
      onClose();
      router.push(payload.hasCase || mode === "login" ? "/dashboard" : "/intake?condition=hair-loss");
      router.refresh();
    } catch {
      setError(mode === "signup" ? "Could not create account." : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    setError("");
    try {
      const user = await signInWithGoogle();
      onClose();
      router.push(user.hasCase || mode === "login" ? "/dashboard" : "/intake?condition=hair-loss");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not sign in with Google.");
    } finally {
      setBusy(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label={drawer.close}
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-[70] bg-black/45 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-drawer-title"
        aria-hidden={!open}
        className={`fixed inset-y-0 right-0 z-[80] flex w-[min(480px,94vw)] flex-col bg-white shadow-[-16px_0_40px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <div className="relative flex items-center justify-center px-6 pb-2 pt-5">
          <button
            type="button"
            aria-label={drawer.close}
            onClick={onClose}
            className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-[#8a8a8a]"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <p id="login-drawer-title" className="text-[16px] font-semibold text-[#11110f]">
            {mode === "signup" ? drawer.createTitle : drawer.title}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-10 pt-8 sm:px-10">
          <h2 className="text-[24px] font-bold leading-[1.1] tracking-[-0.03em] text-[#11110f] sm:text-[26px]">
            {mode === "signup" ? drawer.createHeading : drawer.welcomeBack}
          </h2>

          <form
            className="mt-8 flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
          >
            <input
              type="email"
              autoComplete="email"
              placeholder={drawer.email}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-[52px] w-full rounded-[12px] border border-[#d8d8d8] bg-white px-4 text-[16px] outline-none placeholder:text-[#9a9a9a] focus:border-[#11110f]"
            />
            <div>
              <input
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder={drawer.password}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={passwordTooShortLive}
                aria-describedby={passwordTooShortLive ? "login-password-min-length" : undefined}
                className={`h-[52px] w-full rounded-[12px] border bg-white px-4 text-[16px] outline-none placeholder:text-[#9a9a9a] ${
                  passwordTooShortLive
                    ? "border-[#c24b3a] focus:border-[#c24b3a]"
                    : "border-[#d8d8d8] focus:border-[#11110f]"
                }`}
              />
              {passwordTooShortLive ? (
                <p
                  id="login-password-min-length"
                  role="status"
                  className="mt-1.5 flex items-center gap-1.5 text-[13px] leading-none text-[#c24b3a]"
                >
                  <span
                    className="inline-flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full border-[1.4px] border-current text-[10px] font-semibold"
                    aria-hidden="true"
                  >
                    !
                  </span>
                  {drawer.passwordMinLength}
                </p>
              ) : null}
            </div>
            {mode === "signup" ? (
              <input
                type="password"
                autoComplete="new-password"
                placeholder={drawer.confirmPassword}
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className="h-[52px] w-full rounded-[12px] border border-[#d8d8d8] bg-white px-4 text-[16px] outline-none placeholder:text-[#9a9a9a] focus:border-[#11110f]"
              />
            ) : (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setForgotNotice(true)}
                  className={`text-[14px] font-medium ${CREATE_ACCOUNT_LINK}`}
                >
                  {drawer.forgotPassword}
                </button>
              </div>
            )}
            {forgotNotice && mode === "login" ? (
              <p className="text-right text-[13px] text-black/45">{drawer.forgotUnavailable}</p>
            ) : null}
            {error ? <p className="text-[13px] font-medium text-[#a81d12]">{error}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="mt-1 flex h-[52px] w-full items-center justify-center rounded-full bg-[#11110f] text-[16px] font-semibold text-white disabled:opacity-50"
            >
              {busy ? "…" : mode === "signup" ? drawer.createAccount : drawer.logIn}
            </button>
          </form>

          {mode === "login" ? (
            <p className="mt-5 text-center text-[15px] text-[#11110f]">
              {drawer.firstTime}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setForgotNotice(false);
                }}
                className={`font-semibold ${CREATE_ACCOUNT_LINK}`}
              >
                {drawer.createAccountLink}
              </button>
            </p>
          ) : null}

          <div className="mt-8 flex items-center gap-4 text-[14px] text-[#8a8a8a]">
            <span className="h-px flex-1 bg-[#e4e4e4]" />
            <span>{drawer.or}</span>
            <span className="h-px flex-1 bg-[#e4e4e4]" />
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleGoogle()}
              className="flex h-[52px] w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-[#d0d0d0] bg-white text-[16px] font-medium text-[#11110f] disabled:opacity-50"
            >
              <GoogleMark />
              {drawer.google}
            </button>
            {error ? <p className="text-center text-[13px] font-medium text-[#a81d12]">{error}</p> : null}
            <button
              type="button"
              disabled
              title={drawer.comingSoon}
              className="flex h-[52px] w-full cursor-not-allowed items-center justify-center gap-3 rounded-full border border-[#d0d0d0] bg-white text-[16px] font-medium text-[#11110f] opacity-70"
            >
              <AppleMark />
              {drawer.apple}
            </button>
          </div>

          {mode === "signup" ? (
            <>
              <p className="mx-auto mt-8 max-w-[34ch] text-center text-[13.5px] leading-[1.45] text-[#6a6a6a]">
                {drawer.legal.beforeTerms}
                <Link href="/terms" className="underline decoration-current underline-offset-[3px]">
                  {drawer.legal.terms}
                </Link>
                {drawer.legal.beforePrivacy}
                <Link href="/privacy" className="underline decoration-current underline-offset-[3px]">
                  {drawer.legal.privacy}
                </Link>{drawer.legal.after}
              </p>
              <p className="mt-6 text-center text-[15px] text-[#8a8a8a]">
                {drawer.haveAccount}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setForgotNotice(false);
                  }}
                  className={`font-semibold ${CREATE_ACCOUNT_LINK}`}
                >
                  {drawer.logInLink}
                </button>
              </p>
            </>
          ) : null}
        </div>
      </div>
    </>,
    document.body,
  );
}
