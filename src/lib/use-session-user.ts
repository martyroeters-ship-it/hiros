"use client";

import { useEffect, useState } from "react";

export type ClientSessionUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  city: string | null;
  postalCode: string | null;
  role: string;
};

export function displayName(user: ClientSessionUser | null | undefined): string {
  if (!user) return "";
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  return user.email.split("@")[0] || user.email;
}

export function useSessionUser() {
  const [user, setUser] = useState<ClientSessionUser | null | undefined>(undefined);

  useEffect(() => {
    void fetch("/api/auth/me", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          setUser(null);
          return;
        }
        setUser((await res.json()) as ClientSessionUser);
      })
      .catch(() => setUser(null));
  }, []);

  return user;
}
