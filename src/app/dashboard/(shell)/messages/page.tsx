"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

/* ─── types ──────────────────────────────────────────────────────── */
type Message = {
  id: string;
  role: "patient" | "physician";
  text: string;
  time: string;
  read?: boolean;
};

type Conversation = {
  id: string;
  name: string;
  title: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
  messages: Message[];
};

/* ─── mock data ──────────────────────────────────────────────────── */
const CONVERSATIONS: Conversation[] = [
  {
    id: "yilmaz",
    name: "Dr. Emre Yilmaz",
    title: "Dermatologist · Hiros",
    avatar: "/hiros_logo.png",
    lastMessage: "Early signs of thickening visible. Keep it up!",
    lastTime: "Aug 14",
    unread: 2,
    online: false,
    messages: [
      { id: "1", role: "physician", text: "Hi Martijn, I've reviewed your intake form. Welcome to Hiros! I've prescribed Topical Finasteride 0.25% to start with.", time: "Jun 6, 09:14" },
      { id: "2", role: "patient",   text: "Thank you! Is there anything I should know before starting?", time: "Jun 6, 09:22" },
      { id: "3", role: "physician", text: "Apply a small amount to the affected scalp area once daily. Consistency is key — try to apply at the same time each day. Some mild scalp irritation is normal in the first week.", time: "Jun 6, 09:31" },
      { id: "4", role: "patient",   text: "Got it. I'll start tonight.", time: "Jun 6, 09:35" },
      { id: "5", role: "physician", text: "Perfect. I'll check in with you after your 1-month mark. Don't hesitate to reach out if you have any questions.", time: "Jun 6, 09:36" },
      { id: "6", role: "physician", text: "Hi Martijn, just reviewed your progress photos from your 3-month check-in. Early signs of thickening visible in the frontal area. Hairline appears more defined compared to baseline.", time: "Aug 14, 11:02" },
      { id: "7", role: "physician", text: "Early signs of thickening visible. Keep it up!", time: "Aug 14, 11:03" },
    ],
  },
  {
    id: "care",
    name: "Hiros Care Team",
    title: "Support · Hiros",
    avatar: "/hiros_logo.png",
    lastMessage: "Your next delivery is on track for Jun 22.",
    lastTime: "Jun 18",
    unread: 0,
    online: true,
    messages: [
      { id: "1", role: "physician", text: "Hi Martijn! 👋 I'm from the Hiros care team. Let us know if you have any questions about your treatment or order.", time: "Jun 6, 09:00" },
      { id: "2", role: "patient",   text: "Hi! When will my first order ship?", time: "Jun 6, 10:15" },
      { id: "3", role: "physician", text: "Your order has been confirmed and will ship within 2 business days. You'll receive a tracking link by email.", time: "Jun 6, 10:18" },
      { id: "4", role: "patient",   text: "Thanks!", time: "Jun 6, 10:20" },
      { id: "5", role: "physician", text: "Your next delivery is on track for Jun 22.", time: "Jun 18, 14:05" },
    ],
  },
];

/* ─── helpers ────────────────────────────────────────────────────── */
function groupByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  for (const msg of messages) {
    const date = msg.time.split(",")[0];
    const last = groups[groups.length - 1];
    if (last && last.date === date) {
      last.messages.push(msg);
    } else {
      groups.push({ date, messages: [msg] });
    }
  }
  return groups;
}

/* ─── sub-components ─────────────────────────────────────────────── */
function Avatar({ src, name, size = 40 }: { src: string; name: string; size?: number }) {
  return (
    <div
      className="shrink-0 overflow-hidden rounded-full bg-[#1f4033] flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Image src={src} alt={name} width={size} height={size} className="object-contain p-1.5 opacity-80" />
    </div>
  );
}

/* ─── page ───────────────────────────────────────────────────────── */
export default function MessagesPage() {
  const [activeId, setActiveId] = useState<string>(CONVERSATIONS[0].id);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sentMessages, setSentMessages] = useState<Record<string, Message[]>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = CONVERSATIONS.find((c) => c.id === activeId)!;
  const extra = sentMessages[activeId] ?? [];
  const allMessages = [...active.messages, ...extra];
  const grouped = groupByDate(allMessages);
  const draft = drafts[activeId] ?? "";

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const msg: Message = {
      id: `sent-${Date.now()}`,
      role: "patient",
      text,
      time: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    };
    setSentMessages((prev) => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), msg] }));
    setDrafts((prev) => ({ ...prev, [activeId]: "" }));
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 50);
  };

  return (
    <div className="flex h-full min-h-0 gap-0 overflow-hidden bg-white">

      {/* ── Left: conversation list ── */}
      <div className="flex w-[260px] shrink-0 flex-col border-r border-[#f0ebe2]">
        <div className="px-5 pb-3 pt-5">
          <h1 className="font-title text-[20px] font-medium tracking-[-0.02em] text-[#1f3329]">Messages</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {CONVERSATIONS.map((conv) => {
            const isActive = conv.id === activeId;
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => setActiveId(conv.id)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                  isActive ? "bg-[#f0f5ee]" : "hover:bg-[#faf9f6]"
                }`}
              >
                <div className="relative mt-0.5">
                  <Avatar src={conv.avatar} name={conv.name} size={40} />
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#4a9b5f]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <p className="truncate text-[13px] font-semibold text-[#1f3329]">{conv.name}</p>
                    <span className="shrink-0 text-[11px] text-[#9aa396]">{conv.lastTime}</span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-1">
                    <p className="truncate text-[12px] text-[#8a9288]">{conv.lastMessage}</p>
                    {conv.unread > 0 && (
                      <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[#1f4033] px-1 text-[10px] font-semibold text-white">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right: chat thread ── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Chat header */}
        <div className="flex items-center gap-3 border-b border-[#f0ebe2] px-6 py-4">
          <div className="relative">
            <Avatar src={active.avatar} name={active.name} size={38} />
            {active.online && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#4a9b5f]" />
            )}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#1f3329]">{active.name}</p>
            <p className="text-[12px] text-[#8a9288]">{active.title}</p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            {grouped.map((group) => (
              <div key={group.date} className="flex flex-col gap-1.5">
                {/* Date separator */}
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
                      {/* Physician avatar — only show on first of a run */}
                      {!isPatient && (
                        <div className="mb-0.5 shrink-0">
                          {!prevSame ? (
                            <Avatar src={active.avatar} name={active.name} size={28} />
                          ) : (
                            <div className="w-7" />
                          )}
                        </div>
                      )}

                      <div className={`flex max-w-[70%] flex-col ${isPatient ? "items-end" : "items-start"}`}>
                        <div
                          className={`rounded-[18px] px-4 py-2.5 text-[13px] leading-relaxed ${
                            isPatient
                              ? "rounded-br-[4px] bg-[#1f4033] text-white"
                              : "rounded-bl-[4px] bg-[#f4f1ec] text-[#1f3329]"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="mt-1 px-1 text-[10px] text-[#b0aba3]">
                          {msg.time.split(",")[1]?.trim() ?? msg.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-[#f0ebe2] px-5 py-4">
          <div className="flex items-end gap-3 rounded-[18px] border border-[#e8e4dc] bg-[#faf9f6] px-4 py-3">
            <textarea
              rows={1}
              value={draft}
              onChange={(e) => {
                setDrafts((prev) => ({ ...prev, [activeId]: e.target.value }));
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Message your care team…"
              className="flex-1 resize-none bg-transparent text-[13px] leading-relaxed text-[#1f3329] placeholder-[#b0aba3] outline-none"
              style={{ height: "22px" }}
            />
            <button
              type="button"
              onClick={send}
              disabled={!draft.trim()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1f4033] text-white transition-opacity disabled:opacity-30"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 translate-x-[1px]">
                <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
