"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { DoctorChrome } from "../shell";
import { subscribeStoredCases } from "../store";
import { useDoctorLanguage } from "../use-doctor-language";
import { fetchConversation, fetchConversations, markConversationRead, sendConversationMessage } from "./store";
import type { ConversationSummary, ConversationThread } from "./store";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatListTime(ts: number, locale: string): string {
  const date = new Date(ts);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString(locale, { day: "numeric", month: "short" });
}

function formatClock(ts: number, locale: string): string {
  return new Date(ts).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

function formatDay(ts: number, locale: string): string {
  return new Date(ts).toLocaleDateString(locale, { day: "numeric", month: "short" });
}

function groupByDate(messages: ConversationThread["messages"], locale: string) {
  const groups: { date: string; messages: ConversationThread["messages"] }[] = [];
  for (const msg of messages) {
    const date = formatDay(msg.createdAt, locale);
    const last = groups[groups.length - 1];
    if (last && last.date === date) last.messages.push(msg);
    else groups.push({ date, messages: [msg] });
  }
  return groups;
}

type InboxFilter = "all" | "waiting" | "marked" | "archived";

type InboxPrefs = {
  marked: string[];
  read: string[];
  unread: string[];
  archived: string[];
  deleted: string[];
};

const PREFS_KEY = "hiros-doctor-inbox-prefs";
const MARKED_KEY = "hiros-doctor-marked-conversations";

function emptyPrefs(): InboxPrefs {
  return { marked: [], read: [], unread: [], archived: [], deleted: [] };
}

function loadPrefs(): InboxPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { ...emptyPrefs(), ...(JSON.parse(raw) as Partial<InboxPrefs>) };
    const legacy = localStorage.getItem(MARKED_KEY);
    return { ...emptyPrefs(), marked: legacy ? (JSON.parse(legacy) as string[]) : [] };
  } catch {
    return emptyPrefs();
  }
}

function toggleId(list: string[], id: string, on: boolean): string[] {
  if (on) return list.includes(id) ? list : [...list, id];
  return list.filter((item) => item !== id);
}

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-[#2f5f4f] text-white"
      style={{ width: size, height: size, fontSize: size < 32 ? 10 : 13 }}
    >
      <span className="font-semibold tracking-[-0.02em]">{initials(name)}</span>
    </div>
  );
}

function MessagesPageInner() {
  const { copy, language } = useDoctorLanguage();
  const locale = language === "tr" ? "tr-TR" : "en-GB";
  const searchParams = useSearchParams();
  const preselect = searchParams.get("case") ?? "";
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState("");
  const [thread, setThread] = useState<ConversationThread | undefined>();
  const [draft, setDraft] = useState("");
  const [showThread, setShowThread] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>("all");
  const [prefs, setPrefs] = useState<InboxPrefs>(emptyPrefs);
  const [menuId, setMenuId] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeIdRef = useRef(activeId);
  const showThreadRef = useRef(showThread);
  activeIdRef.current = activeId;
  showThreadRef.current = showThread;

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  useEffect(() => {
    if (!menuId) return;
    const onDoc = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuId("");
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuId]);

  const updatePrefs = (patch: (current: InboxPrefs) => InboxPrefs) => {
    setPrefs((current) => {
      const next = patch(current);
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
    setMenuId("");
  };

  const isUnread = (item: ConversationSummary) =>
    prefs.unread.includes(item.caseId) || (item.unread && !prefs.read.includes(item.caseId));

  const loadList = (wipeOnError = true) =>
    fetchConversations()
      .then((items) => {
        setConversations(items);
        setLoadError(false);
        return items;
      })
      .catch(() => {
        if (wipeOnError) {
          setLoadError(true);
          setConversations([]);
        }
        return [] as ConversationSummary[];
      });

  useEffect(() => {
    void loadList().then((items) => {
      const next = items.find((item) => item.caseId === preselect)?.caseId ?? items[0]?.caseId ?? "";
      setActiveId(next);
      if (preselect || next) setShowThread(Boolean(preselect) || window.innerWidth >= 1024);
    });
  }, [preselect]);

  useEffect(() => {
    return subscribeStoredCases(() => {
      void loadList(false);
      const id = activeIdRef.current;
      if (!id) return;
      void fetchConversation(id).then(setThread).catch(() => undefined);
      if (showThreadRef.current) void markConversationRead(id);
    });
  }, []);

  useEffect(() => {
    if (!activeId) {
      setThread(undefined);
      return;
    }
    void fetchConversation(activeId).then(setThread).catch(() => setThread(undefined));
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;
    if (!showThread && window.innerWidth < 1024) return;
    setConversations((items) => {
      if (!items.some((item) => item.caseId === activeId && item.unread)) return items;
      return items.map((item) => (item.caseId === activeId ? { ...item, unread: false } : item));
    });
    setPrefs((current) => {
      if (current.read.includes(activeId) && !current.unread.includes(activeId)) return current;
      const next = {
        ...current,
        read: toggleId(current.read, activeId, true),
        unread: toggleId(current.unread, activeId, false),
      };
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
    void markConversationRead(activeId);
  }, [activeId, showThread]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread?.messages.length]);

  const grouped = useMemo(() => (thread ? groupByDate(thread.messages, locale) : []), [thread, locale]);
  const activeSummary = conversations.find((item) => item.caseId === activeId);
  const inbox = useMemo(
    () => conversations.filter((item) => !prefs.deleted.includes(item.caseId) && !prefs.archived.includes(item.caseId)),
    [conversations, prefs.archived, prefs.deleted],
  );
  const unreadCount = inbox.filter(isUnread).length;
  const markedCount = inbox.filter((item) => prefs.marked.includes(item.caseId)).length;
  const archivedCount = conversations.filter(
    (item) => prefs.archived.includes(item.caseId) && !prefs.deleted.includes(item.caseId),
  ).length;

  const visibleConversations = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return conversations.filter((item) => {
      if (prefs.deleted.includes(item.caseId)) return false;
      if (inboxFilter === "archived") {
        if (!prefs.archived.includes(item.caseId)) return false;
      } else if (prefs.archived.includes(item.caseId)) {
        return false;
      }
      if (inboxFilter === "waiting" && !isUnread(item)) return false;
      if (inboxFilter === "marked" && !prefs.marked.includes(item.caseId)) return false;
      if (!needle) return true;
      return [item.patientName, item.lastMessage, item.city, item.treatmentName]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [conversations, inboxFilter, prefs, query]);

  const send = async () => {
    const text = draft.trim();
    if (!text || !activeId || busy) return;
    setBusy(true);
    try {
      await sendConversationMessage(activeId, text);
      setDraft("");
      const [nextThread] = await Promise.all([fetchConversation(activeId), loadList()]);
      setThread(nextThread);
    } finally {
      setBusy(false);
    }
  };

  return (
    <DoctorChrome active="messages" title={copy.pages.messages}>
      <main className="flex h-[calc(100dvh-57px)] min-h-0 bg-white pb-[4.25rem] lg:h-[calc(100vh-61px)] lg:pb-0">
        <div className={`${showThread ? "hidden lg:flex" : "flex"} w-full shrink-0 flex-col border-r border-black/[0.06] lg:w-[300px]`}>
          <div className="shrink-0 space-y-2 border-b border-black/[0.06] px-3 py-3">
            <label className="flex items-center gap-2 rounded-full border border-black/10 bg-[#f7f6f3] px-3 py-1.5">
              <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 shrink-0 text-black/35" aria-hidden="true">
                <circle cx="8.5" cy="8.5" r="5.25" stroke="currentColor" strokeWidth="1.6" />
                <path d="M12.4 12.4 16 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={copy.messages.search}
                className="w-full bg-transparent text-[13px] text-[#1f241b] outline-none placeholder:text-black/35"
              />
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { key: "all" as const, label: copy.messages.all, count: inbox.length },
                  { key: "waiting" as const, label: copy.messages.unread, count: unreadCount },
                  { key: "marked" as const, label: copy.messages.marked, count: markedCount },
                  ...(archivedCount > 0 ? [{ key: "archived" as const, label: copy.messages.archived, count: archivedCount }] : []),
                ] as const
              ).map((item) => {
                const active = inboxFilter === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setInboxFilter(item.key)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition ${
                      active
                        ? "bg-[#2f5f4f] text-white"
                        : "border border-black/10 bg-white text-[#2b2a28] hover:bg-black/[0.03]"
                    }`}
                  >
                    {item.label}
                    <span className={active ? "text-white/75" : "text-black/40"}>{item.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {visibleConversations.map((conv) => {
              const selected = conv.caseId === activeId;
              const marked = prefs.marked.includes(conv.caseId);
              const unread = isUnread(conv);
              const archived = prefs.archived.includes(conv.caseId);
              const menuOpen = menuId === conv.caseId;
              return (
                <div
                  key={conv.caseId}
                  className={`group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                    selected ? "bg-[#eef4ea]" : "hover:bg-[#f7f6f3]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveId(conv.caseId);
                      setShowThread(true);
                    }}
                    className="mt-0.5"
                  >
                    <Avatar name={conv.patientName} size={40} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <Link
                        href={`/doctor/patients/${conv.caseId}`}
                        className="truncate text-[13px] font-semibold text-[#1f241b] hover:underline"
                      >
                        {conv.patientName}
                      </Link>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button type="button" onClick={() => { setActiveId(conv.caseId); setShowThread(true); }} className="text-[11px] text-black/35">
                          {formatListTime(conv.lastAt, locale)}
                        </button>
                        {unread ? (
                          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d92d20] px-1 text-[9px] font-bold leading-none text-white">
                            1
                          </span>
                        ) : null}
                        <div className="relative" ref={menuOpen ? menuRef : undefined}>
                          <button
                            type="button"
                            aria-label="Conversation actions"
                            onClick={() => setMenuId(menuOpen ? "" : conv.caseId)}
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-black/45 hover:bg-black/[0.06] ${
                              menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                              <path d="M5.5 7.75 10 12.25l4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          {menuOpen ? (
                            <div className="absolute right-0 top-full z-30 mt-1 w-[168px] overflow-hidden rounded-[10px] border border-black/10 bg-white py-1 shadow-[0_10px_28px_rgba(0,0,0,0.12)]">
                              <button
                                type="button"
                                onClick={() => {
                                  updatePrefs((current) => ({
                                    ...current,
                                    read: toggleId(current.read, conv.caseId, unread),
                                    unread: toggleId(current.unread, conv.caseId, !unread),
                                  }));
                                  if (unread) {
                                    setConversations((items) =>
                                      items.map((item) => (item.caseId === conv.caseId ? { ...item, unread: false } : item)),
                                    );
                                    void markConversationRead(conv.caseId);
                                  }
                                }}
                                className="flex w-full px-3 py-2 text-left text-[12.5px] text-[#1f241b] hover:bg-[#f7f6f3]"
                              >
                                {unread ? copy.messages.markRead : copy.messages.markUnread}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updatePrefs((current) => ({
                                    ...current,
                                    marked: toggleId(current.marked, conv.caseId, !marked),
                                  }))
                                }
                                className="flex w-full px-3 py-2 text-left text-[12.5px] text-[#1f241b] hover:bg-[#f7f6f3]"
                              >
                                {marked ? copy.messages.unmark : copy.messages.mark}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updatePrefs((current) => ({
                                    ...current,
                                    archived: toggleId(current.archived, conv.caseId, !archived),
                                  }))
                                }
                                className="flex w-full px-3 py-2 text-left text-[12.5px] text-[#1f241b] hover:bg-[#f7f6f3]"
                              >
                                {archived ? copy.messages.unarchive : copy.messages.archive}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updatePrefs((current) => ({
                                    ...current,
                                    deleted: toggleId(current.deleted, conv.caseId, true),
                                  }))
                                }
                                className="flex w-full px-3 py-2 text-left text-[12.5px] text-[#a81d12] hover:bg-[#f7f6f3]"
                              >
                                {copy.messages.delete}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveId(conv.caseId);
                        setShowThread(true);
                      }}
                      className="mt-0.5 w-full text-left"
                    >
                      <p className="truncate text-[12px] text-black/45">
                        {conv.lastFrom === "doctor" ? copy.messages.you : ""}
                        {conv.lastMessage}
                      </p>
                    </button>
                  </div>
                </div>
              );
            })}
            {conversations.length === 0 ? (
              <p className="px-5 py-10 text-[13px] font-medium text-black/40">
                {loadError ? copy.messages.loadError : copy.messages.empty}
              </p>
            ) : visibleConversations.length === 0 ? (
              <p className="px-5 py-10 text-[13px] font-medium text-black/40">{copy.messages.noMatch}</p>
            ) : null}
          </div>
        </div>

        <div className={`${showThread ? "flex" : "hidden lg:flex"} min-w-0 flex-1 flex-col`}>
          {thread || activeSummary ? (
            <>
              <div className="flex items-center gap-3 border-b border-black/[0.06] px-4 py-3.5 lg:px-6">
                <button
                  type="button"
                  onClick={() => setShowThread(false)}
                  aria-label={copy.messages.back}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4f5f3] text-[#2f5f4f] lg:hidden"
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                    <path d="M11.75 5.75 7.5 10l4.25 4.25" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <Avatar name={thread?.patientName ?? activeSummary?.patientName ?? ""} size={38} />
                <div className="min-w-0">
                  <Link
                    href={`/doctor/patients/${activeId}`}
                    className="block truncate text-[14px] font-semibold text-[#1f241b] hover:underline"
                  >
                    {thread?.patientName ?? activeSummary?.patientName}
                  </Link>
                  <p className="truncate text-[12px] text-black/40">
                    {thread?.city || activeSummary?.city} · {thread?.treatmentName || activeSummary?.treatmentName}
                  </p>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 lg:px-6">
                <div className="flex flex-col gap-5">
                  {grouped.map((group) => (
                    <div key={group.date} className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-3 py-1">
                        <div className="h-px flex-1 bg-black/[0.06]" />
                        <span className="text-[11px] font-medium text-black/35">{group.date}</span>
                        <div className="h-px flex-1 bg-black/[0.06]" />
                      </div>
                      {group.messages.map((msg, index) => {
                        const mine = msg.from === "doctor";
                        const prevSame = index > 0 && group.messages[index - 1].from === msg.from;
                        return (
                          <div
                            key={msg.id}
                            className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : "flex-row"} ${prevSame ? "mt-0.5" : "mt-2"}`}
                          >
                            {!mine ? (
                              <div className="mb-0.5 shrink-0">
                                {prevSame ? <div className="w-7" /> : <Avatar name={thread?.patientName ?? ""} size={28} />}
                              </div>
                            ) : null}
                            <div className={`flex max-w-[85%] flex-col lg:max-w-[70%] ${mine ? "items-end" : "items-start"}`}>
                              <div
                                className={`rounded-[18px] px-4 py-2.5 text-[13px] leading-relaxed ${
                                  mine
                                    ? "rounded-br-[4px] bg-[#2f5f4f] text-white"
                                    : "rounded-bl-[4px] bg-[#f4f5f3] text-[#1f241b]"
                                }`}
                              >
                                {msg.body}
                              </div>
                              <span className="mt-1 px-1 text-[10px] text-black/35">{formatClock(msg.createdAt, locale)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-black/[0.06] px-4 py-4 lg:px-5">
                <div className="flex items-end gap-3 rounded-[18px] border border-black/10 bg-[#f7f6f3] px-4 py-3">
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
                    placeholder={copy.messages.write}
                    className="flex-1 resize-none bg-transparent text-[13px] leading-relaxed text-[#1f241b] placeholder-black/35 outline-none"
                    style={{ height: "22px" }}
                  />
                  <button
                    type="button"
                    onClick={() => void send()}
                    disabled={busy || !draft.trim()}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2f5f4f] text-white transition-opacity disabled:opacity-30"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 translate-x-[1px]">
                      <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center px-6 text-[14px] font-medium text-black/35">
              {copy.messages.select}
            </div>
          )}
        </div>
      </main>
    </DoctorChrome>
  );
}

function MessagesFallback() {
  const { copy } = useDoctorLanguage();
  return (
    <DoctorChrome active="messages" title={copy.pages.messages}>
      <main className="px-6 py-16 text-black/40">{copy.messages.loading}</main>
    </DoctorChrome>
  );
}

export default function DoctorMessagesPage() {
  return (
    <Suspense fallback={<MessagesFallback />}>
      <MessagesPageInner />
    </Suspense>
  );
}
