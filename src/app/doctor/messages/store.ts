import { notifyCasesChanged } from "../store";
import type { ConversationSummary, ConversationThread } from "@/lib/patients-repo";

export type { ConversationSummary, ConversationThread };

export async function fetchConversations(): Promise<ConversationSummary[]> {
  const res = await fetch("/api/messages", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load messages");
  return (await res.json()) as ConversationSummary[];
}

export async function fetchConversation(caseId: string): Promise<ConversationThread | undefined> {
  const res = await fetch(`/api/messages/${caseId}`, { cache: "no-store" });
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error("Could not load conversation");
  return (await res.json()) as ConversationThread;
}

export async function markConversationRead(caseId: string): Promise<boolean> {
  const res = await fetch(`/api/messages/${caseId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ read: true }),
  });
  if (!res.ok) return false;
  const payload = (await res.json().catch(() => ({}))) as { changed?: boolean };
  if (payload.changed) notifyCasesChanged();
  return Boolean(payload.changed);
}

export async function sendConversationMessage(caseId: string, body: string): Promise<void> {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caseId, body }),
  });
  if (!res.ok) {
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error || "Could not send message");
  }
  notifyCasesChanged();
}
