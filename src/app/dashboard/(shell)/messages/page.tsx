"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { PhysicianMessageLock } from "@/components/dashboard/PhysicianMessageLock";
import type { DashboardMessage, PatientDashboardSnapshot } from "@/lib/patient-dashboard-types";
import { usePatientDashboard } from "@/lib/use-patient-dashboard";

type ThreadMessage = {
  id: string;
  role: "patient" | "physician";
  text: string;
  date: string;
  time: string;
};

function toThreadMessages(snapshot: PatientDashboardSnapshot | null): ThreadMessage[] {
  return (snapshot?.messages ?? []).map((msg: DashboardMessage) => ({
    id: msg.id,
    role: msg.from === "doctor" ? "physician" : "patient",
    text: msg.body,
    date: msg.date,
    time: msg.time,
  }));
}

function groupByDate(messages: ThreadMessage[]) {
  const groups: { date: string; messages: ThreadMessage[] }[] = [];
  for (const msg of messages) {
    const last = groups[groups.length - 1];
    if (last && last.date === msg.date) last.messages.push(msg);
    else groups.push({ date: msg.date, messages: [msg] });
  }
  return groups;
}

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1f4033]" style={{ width: size, height: size }}>
      <Image src="/hiros_logo.png" alt={name} width={size} height={size} className="object-contain p-1.5 opacity-80" />
    </div>
  );
}

export default function MessagesPage() {
  const { snapshot, reload } = usePatientDashboard();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [showThread, setShowThread] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const doctorName = snapshot?.doctorName || "Your physician";
  const doctorTitle = snapshot?.doctorSpecialty ? `${snapshot.doctorSpecialty} · Hiros` : "Physician · Hiros";
  const messages = useMemo(() => toThreadMessages(snapshot), [snapshot]);
  const grouped = groupByDate(messages);
  const last = messages[messages.length - 1];
  const canCompose = Boolean(snapshot?.isPremium && snapshot.caseId);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  const send = async () => {
    const text = draft.trim();
    if (!text || !canCompose || sending) return;
    setSending(true);
    setSendError("");
    try {
      const res = await fetch("/api/dashboard/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Could not send message");
      }
      setDraft("");
      reload();
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Could not send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 gap-0 overflow-hidden bg-white">
      <div className={`${showThread ? "hidden lg:flex" : "flex"} w-full shrink-0 flex-col border-r border-[#f0ebe2] lg:w-[260px]`}>
        <div className="px-5 pb-3 pt-5">
          <h1 className="font-title text-[20px] font-medium tracking-[-0.02em] text-[#1f3329]">Messages</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          <button
            type="button"
            onClick={() => setShowThread(true)}
            className="flex w-full items-start gap-3 bg-[#f0f5ee] px-4 py-3 text-left"
          >
            <div className="relative mt-0.5">
              <Avatar name={doctorName} size={40} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-1">
                <p className="truncate text-[13px] font-semibold text-[#1f3329]">{doctorName}</p>
                <span className="shrink-0 text-[11px] text-[#9aa396]">{last?.date ?? ""}</span>
              </div>
              <p className="mt-0.5 truncate text-[12px] text-[#8a9288]">
                {last?.text || (snapshot?.caseId ? "No messages yet" : "Complete intake to message your physician")}
              </p>
            </div>
          </button>
        </div>
      </div>

      <div className={`${showThread ? "flex" : "hidden lg:flex"} min-w-0 flex-1 flex-col`}>
        <div className="flex items-center gap-3 border-b border-[#f0ebe2] px-4 py-4 lg:px-6">
          <button
            type="button"
            onClick={() => setShowThread(false)}
            aria-label="Back to conversations"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4f1ec] text-[#1f4033] lg:hidden"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M11.75 5.75 7.5 10l4.25 4.25" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <Avatar name={doctorName} size={38} />
          <div>
            <p className="text-[14px] font-semibold text-[#1f3329]">{doctorName}</p>
            <p className="text-[12px] text-[#8a9288]">{doctorTitle}</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 lg:px-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <p className="text-[14px] font-semibold text-[#3d4540]">No messages yet</p>
              <p className="mt-1 max-w-[36ch] text-[13px] leading-relaxed text-[#8a9288]">
                {snapshot?.caseId
                  ? `When ${doctorName} writes to you, it will appear here.`
                  : "Complete your intake so a physician can be assigned to your case."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {grouped.map((group) => (
                <div key={group.date} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-3 py-1">
                    <div className="h-px flex-1 bg-[#f0ebe2]" />
                    <span className="text-[11px] font-medium text-[#b0aba3]">{group.date}</span>
                    <div className="h-px flex-1 bg-[#f0ebe2]" />
                  </div>
                  {group.messages.map((msg, i) => {
                    const isPatient = msg.role === "patient";
                    const prevSame = i > 0 && group.messages[i - 1].role === msg.role;
                    return (
                      <div key={msg.id} className={`flex items-end gap-2 ${isPatient ? "flex-row-reverse" : "flex-row"} ${prevSame ? "mt-0.5" : "mt-2"}`}>
                        {!isPatient && (
                          <div className="mb-0.5 shrink-0">{!prevSame ? <Avatar name={doctorName} size={28} /> : <div className="w-7" />}</div>
                        )}
                        <div className={`flex max-w-[85%] flex-col lg:max-w-[70%] ${isPatient ? "items-end" : "items-start"}`}>
                          <div
                            className={`rounded-[18px] px-4 py-2.5 text-[13px] leading-relaxed ${
                              isPatient ? "rounded-br-[4px] bg-[#1f4033] text-white" : "rounded-bl-[4px] bg-[#f4f1ec] text-[#1f3329]"
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="mt-1 px-1 text-[10px] text-[#b0aba3]">{msg.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-[#f0ebe2] px-5 py-4">
          {canCompose ? (
            <>
              <div className="flex items-end gap-3 rounded-[18px] border border-[#e8e4dc] bg-[#faf9f6] px-4 py-3">
                <textarea
                  rows={1}
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  placeholder={`Message ${doctorName}…`}
                  className="flex-1 resize-none bg-transparent text-[13px] leading-relaxed text-[#1f3329] placeholder-[#b0aba3] outline-none"
                  style={{ height: "22px" }}
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={!draft.trim() || sending}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1f4033] text-white transition-opacity disabled:opacity-30"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 translate-x-[1px]">
                    <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
              {sendError ? <p className="mt-2 text-[12px] text-[#a85f3f]">{sendError}</p> : null}
            </>
          ) : (
            <PhysicianMessageLock doctorName={snapshot?.doctorName} />
          )}
        </div>
      </div>
    </div>
  );
}
