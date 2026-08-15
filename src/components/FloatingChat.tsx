"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

const starterSuggestions = ["Hair loss", "Skin concerns", "Sexual health"];

function getAssistantReply(message: string) {
  const input = message.toLowerCase();

  if (input.includes("hair")) {
    return "I can help you get started with hair loss support. You can begin with a private intake, share your symptoms, and a licensed physician can review the next appropriate step.";
  }

  if (input.includes("skin")) {
    return "I can help with skin concerns too. The fastest next step is to start an intake so you can describe what you are experiencing clearly and privately.";
  }

  if (input.includes("sexual")) {
    return "For sexual health concerns, Hiros is designed to make the process feel private and straightforward. You can start with guided questions and receive physician-reviewed next steps.";
  }

  if (input.includes("doctor") || input.includes("physician") || input.includes("licensed")) {
    return "Your information is reviewed by licensed physicians who determine the right next step based on what you share.";
  }

  if (input.includes("private") || input.includes("privacy") || input.includes("secure")) {
    return "Hiros is built around privacy. You can start from your own space, and your information is only shared with the medical professionals involved in your care.";
  }

  if (input.includes("how") || input.includes("start") || input.includes("intake")) {
    return "You can start by selecting what you would like help with and completing a short intake. From there, a physician reviews your information and guides the next step.";
  }

  return "I can help you understand where to start, what Hiros supports, and how the intake works. Tell me what you would like help with.";
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "assistant-initial",
      role: "assistant",
      content: "Hi, I’m the Hiros assistant. How can I help you today?",
    },
  ]);
  const timeoutRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isThinking]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const sendMessage = (message: string) => {
    const trimmed = message.trim();

    if (!trimmed || isThinking) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
      },
    ]);
    setInput("");
    setIsThinking(true);

    timeoutRef.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: getAssistantReply(trimmed),
        },
      ]);
      setIsThinking(false);
    }, 350);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {isOpen ? (
        <div
          id="hiros-chat-modal"
          role="dialog"
          aria-modal="false"
          aria-label="Hiros assistant"
          className="fixed bottom-24 right-6 z-[70] flex h-[560px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-start justify-between border-b border-black/8 bg-[#fbfaf5] px-5 py-4">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#848484]">Hiros AI</p>
              <h3 className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-black">How can I help?</h3>
            </div>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-[#1a1a1a]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-black/8 px-4 py-3">
            {starterSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => sendMessage(suggestion)}
                className="rounded-full bg-[#f2efe7] px-3 py-2 text-[13px] font-medium text-black transition-colors hover:bg-[#e6e0d2]"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-white px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-[14px] leading-[1.45] ${
                    message.role === "user"
                      ? "rounded-br-md bg-black text-white"
                      : "rounded-bl-md bg-[#f4f0e7] text-black"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isThinking ? (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-[#f4f0e7] px-4 py-3 text-[14px] text-black">
                  Thinking…
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-black/8 bg-white p-4">
            <div className="flex items-end gap-3 rounded-[22px] border border-black/10 bg-[#fbfaf5] p-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={1}
                placeholder="Ask about Hiros…"
                className="max-h-28 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2 text-[14px] text-black outline-none placeholder:text-black/40"
              />
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white transition-all hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path d="M4 12 20 4l-4.5 16-3.2-5.3L4 12Z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Open chat"
        aria-expanded={isOpen}
        aria-controls="hiros-chat-modal"
        onClick={() => setIsOpen((current) => !current)}
        className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition-transform duration-300 hover:scale-105 hover:bg-[#1a1a1a]"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
          <path d="M6.75 18.5 3.5 20V6.75A2.25 2.25 0 0 1 5.75 4.5h12.5a2.25 2.25 0 0 1 2.25 2.25v8.5a2.25 2.25 0 0 1-2.25 2.25H6.75Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8 9.25h8M8 12.25h5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </>
  );
}
