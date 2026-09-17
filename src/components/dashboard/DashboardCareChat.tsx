"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = { id: string; role: "assistant" | "user"; content: string };

type CareChatProps = {
  firstName?: string | null;
  doctorName?: string | null;
  treatmentName?: string | null;
  followUp?: string | null;
  isPremium?: boolean;
};

function greetingPrefix() {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "Good morning";
  if (h >= 12 && h < 18) return "Good afternoon";
  if (h >= 18 && h < 24) return "Good evening";
  return "Good night";
}

function getGreeting(firstName?: string | null) {
  const prefix = greetingPrefix();
  return firstName ? `${prefix}, ${firstName}` : prefix;
}

function getReply(
  msg: string,
  { doctorName, treatmentName, followUp, isPremium }: CareChatProps,
): string {
  const t = msg.toLowerCase();
  const doctor = doctorName || "your physician";
  const treatment = treatmentName || "your treatment";
  if (t.includes("side effect") || t.includes("bijwerking")) {
    return `Side effects with ${treatment} are uncommon and usually mild. If you notice anything that concerns you, please describe it here and I'll flag it for ${doctor} to review.`;
  }
  if (t.includes("delivery") || t.includes("order") || t.includes("ship") || t.includes("when")) {
    return "Order updates appear on your dashboard as soon as they’re available. If something looks off, I can pass it to the care team.";
  }
  if (t.includes("how") && (t.includes("use") || t.includes("apply"))) {
    return `Apply ${treatment} as prescribed, ideally at the same time each day. Wash your hands after use. If you have questions about technique, I can connect you with the care team.`;
  }
  if (t.includes("photo") || t.includes("baseline") || t.includes("progress")) {
    return "Photos help track your progress over time. You can upload them from Progress or the Photos page. It only takes a minute and makes follow-up reviews much more useful.";
  }
  if (t.includes("doctor") || t.includes("physician") || t.includes("message")) {
    if (isPremium) {
      return `${doctor} typically responds within 24 hours. You can message them from the Messages tab.`;
    }
    return `${doctor} typically responds within 24 hours. Direct physician messaging is included in Hiros Premium. You can still book a call or keep chatting with the care team here.`;
  }
  if (t.includes("review") || t.includes("next")) {
    return followUp
      ? `Your next treatment review is scheduled for ${followUp}. ${doctor} will assess your progress and adjust the plan if needed.`
      : `Your next review date will appear here once ${doctor} sets it.`;
  }
  if (t.includes("cancel") || t.includes("stop") || t.includes("pause")) {
    return `If you'd like to pause or cancel your treatment, I can pass that request to the care team. Would you like me to do that, or would you prefer to speak with ${doctor} first?`;
  }
  if (t.includes("payment") || t.includes("invoice") || t.includes("cost") || t.includes("price") || t.includes("premium")) {
    return "Direct messages with your physician are included in Hiros Premium. For billing questions, our care team can help directly.";
  }
  return "I'm here to help with anything related to your Hiros treatment. Feel free to ask about side effects, your order, how to use your treatment, or anything else on your mind.";
}

export function DashboardCareChat(props: CareChatProps) {
  const [greeting, setGreeting] = useState("Hello");
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "I'm your Hiros care assistant. How can I help you with your treatment today?",
    },
  ]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const quickActions = [
    "How do I use my treatment?",
    "When does my order arrive?",
    "Side effects I should know about",
    props.isPremium ? `Message ${props.doctorName || "my physician"}` : "How does a physician review work?",
  ];

  useEffect(() => {
    const next = getGreeting(props.firstName);
    setGreeting(next);
    setMessages((current) =>
      current[0]?.id === "init"
        ? [{ id: "init", role: "assistant", content: `${next} 👋 I'm your Hiros care assistant. How can I help you with your treatment today?` }, ...current.slice(1)]
        : current,
    );
  }, [props.firstName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, thinking]);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", content: trimmed }]);
    setInput("");
    setThinking(true);
    timeoutRef.current = setTimeout(() => {
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", content: getReply(trimmed, props) }]);
      setThinking(false);
    }, 400);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Hiros care assistant"
          className="fixed inset-x-4 bottom-4 z-[70] flex h-[min(520px,calc(100dvh-2rem))] w-auto max-w-none flex-col overflow-hidden rounded-[28px] border border-[#e4e0d8] bg-white shadow-[0_24px_60px_rgba(31,51,41,0.18)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[520px] sm:w-[360px] sm:max-w-[calc(100vw-2rem)]"
        >
          <div className="flex items-start justify-between bg-[#1f4033] px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">Hiros Care</p>
              <h3 className="mt-0.5 font-title text-[20px] font-medium leading-tight text-white">{greeting}</h3>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 border-b border-[#f0ebe2] bg-[#faf9f6] px-4 py-3">
            {quickActions.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => send(a)}
                className="rounded-full bg-[#edeae5] px-3 py-1.5 text-[11px] font-medium text-[#3d4540] transition-colors hover:bg-[#e4e0d8]"
              >
                {a}
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-white px-4 py-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-sm bg-[#1f4033] text-white"
                      : "rounded-bl-sm bg-[#f0ede8] text-[#3d4540]"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-[#f0ede8] px-4 py-2.5 text-[13px] text-[#8a9288]">
                  Typing…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-[#f0ebe2] bg-white p-3">
            <div className="flex items-center gap-2 rounded-full border border-[#e4e0d8] bg-[#faf9f6] px-4 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your treatment…"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-[#3d4540] outline-none placeholder:text-[#b0aba3]"
              />
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1f4033] text-white transition-opacity disabled:opacity-30"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12 20 4l-4.5 16-3.2-5.3L4 12Z" fill="currentColor" stroke="none" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        id="dashboard-care-chat-trigger"
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="hidden"
        aria-label="Open care chat"
      />
    </>
  );
}
