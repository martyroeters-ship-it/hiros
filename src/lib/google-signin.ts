type GoogleTokenClient = {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
};

type GoogleOauth2 = {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: { access_token?: string; error?: string }) => void;
  }) => GoogleTokenClient;
};

type GoogleAccounts = {
  oauth2: GoogleOauth2;
};

declare global {
  interface Window {
    google?: { accounts?: GoogleAccounts };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadGis(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google sign-in is only available in the browser."));
  }
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Could not load Google sign-in.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Google sign-in."));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

// Public OAuth web client ID. Keep this a string literal so production
// builds do not depend on a Vercel NEXT_PUBLIC_ env var being present.
const GOOGLE_CLIENT_ID = "939534131882-pp3dipvtdno9aoklhl81m8tiv3n1l4pt.apps.googleusercontent.com";

export async function requestGoogleAccessToken(): Promise<string> {
  const clientId = GOOGLE_CLIENT_ID;
  await loadGis();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) {
    throw new Error("Could not load Google sign-in.");
  }

  return new Promise((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error("Google sign-in was cancelled."));
          return;
        }
        resolve(response.access_token);
      },
    });
    client.requestAccessToken({ prompt: "select_account" });
  });
}

export async function signInWithGoogle(): Promise<{ email?: string }> {
  const accessToken = await requestGoogleAccessToken();
  const res = await fetch("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken }),
  });
  const payload = (await res.json().catch(() => ({}))) as { error?: string; email?: string };
  if (!res.ok) {
    const raw = payload.error || "";
    if (/ECONNREFUSED|127\.0\.0\.1|NO_DATABASE|connect/i.test(raw)) {
      throw new Error("Could not save your account. The live database is not connected yet.");
    }
    throw new Error(raw || "Could not sign in with Google.");
  }
  return payload;
}
