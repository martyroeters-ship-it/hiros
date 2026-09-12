"use client";

import { displayName, useSessionUser } from "@/lib/use-session-user";

function greetingPrefix() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  if (hour >= 18 && hour < 24) return "Good evening";
  return "Good night";
}

export function Greeting() {
  const user = useSessionUser();
  const name = user ? displayName(user) : "";
  return <>{name ? `${greetingPrefix()}, ${name}` : greetingPrefix()}</>;
}
