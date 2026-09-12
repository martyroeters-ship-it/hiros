"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { DoctorChrome } from "../shell";
import { fetchTreatmentPatients } from "../patients/store";
import type { TreatmentPatient } from "../patients/types";
import { createAppointmentRequest, fetchAppointments, patchAppointment } from "./store";
import type { AppointmentStatus, VideoAppointment } from "./types";

function startOfDay(value: Date): Date {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfWeek(value: Date): Date {
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const next = startOfDay(value);
  next.setDate(next.getDate() + diff);
  return next;
}

function startOfMonth(value: Date): Date {
  return startOfDay(new Date(value.getFullYear(), value.getMonth(), 1));
}

function shiftMonth(value: Date, amount: number): Date {
  return startOfMonth(new Date(value.getFullYear(), value.getMonth() + amount, 1));
}

function monthCells(month: Date): Date[] {
  const first = startOfMonth(month);
  const start = startOfWeek(first);
  const last = startOfDay(new Date(month.getFullYear(), month.getMonth() + 1, 0));
  const end = startOfWeek(last);
  end.setDate(end.getDate() + 6);
  const cells: Date[] = [];
  for (let cursor = new Date(start); cursor.getTime() <= end.getTime(); cursor.setDate(cursor.getDate() + 1)) {
    cells.push(new Date(cursor));
  }
  return cells;
}

function sameDay(a: number, b: Date | null): boolean {
  if (!b) return false;
  const date = new Date(a);
  return date.getFullYear() === b.getFullYear() && date.getMonth() === b.getMonth() && date.getDate() === b.getDate();
}

function inMonth(day: Date, month: Date): boolean {
  return day.getFullYear() === month.getFullYear() && day.getMonth() === month.getMonth();
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatDay(date: Date): string {
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function statusLabel(status: AppointmentStatus): string {
  if (status === "requested") return "Patient request";
  if (status === "scheduled") return "Scheduled";
  if (status === "completed") return "Completed";
  return "Cancelled";
}

function statusClass(status: AppointmentStatus): string {
  if (status === "requested") return "bg-[#fbe0b8] text-[#9a4e07]";
  if (status === "scheduled") return "bg-[#e6f1e2] text-[#3f5f35]";
  if (status === "completed") return "bg-black/[0.06] text-black/55";
  return "bg-[#fbcec5] text-[#a81d12]";
}

function AgendaPageInner() {
  const searchParams = useSearchParams();
  const preselect = searchParams.get("invite") ?? "";
  const [appointments, setAppointments] = useState<VideoAppointment[]>([]);
  const [patients, setPatients] = useState<TreatmentPatient[]>([]);
  const [view, setView] = useState<"week" | "month">("month");
  const [weekStart, setWeekStart] = useState<Date | null>(null);
  const [monthCursor, setMonthCursor] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [caseId, setCaseId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState(false);
  const [didFocus, setDidFocus] = useState(false);

  const reload = () => {
    void fetchAppointments()
      .then(setAppointments)
      .catch(() => {
        setLoadError(true);
        setAppointments([]);
      });
  };

  useEffect(() => {
    const today = startOfDay(new Date());
    setSelectedDay(today);
    setWeekStart(startOfWeek(today));
    setMonthCursor(startOfMonth(today));
    if (preselect) {
      setCaseId(preselect);
      setInviteOpen(true);
    }
    reload();
    void fetchTreatmentPatients().then(setPatients).catch(() => setPatients([]));
  }, [preselect]);

  useEffect(() => {
    if (didFocus || appointments.length === 0) return;
    const next = appointments.find(
      (item) => item.status !== "cancelled" && item.status !== "completed" && item.startsAt >= startOfDay(new Date()).getTime(),
    );
    if (!next) return;
    const day = startOfDay(new Date(next.startsAt));
    setSelectedDay(day);
    setWeekStart(startOfWeek(day));
    setMonthCursor(startOfMonth(day));
    setDidFocus(true);
  }, [appointments, didFocus]);

  const days = useMemo(() => {
    if (!weekStart) return [];
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return date;
    });
  }, [weekStart]);

  const monthDays = useMemo(() => (monthCursor ? monthCells(monthCursor) : []), [monthCursor]);

  const selectDay = (day: Date) => {
    setSelectedDay(day);
    setWeekStart(startOfWeek(day));
    setMonthCursor(startOfMonth(day));
  };

  const visibleAppointments = (day: Date) =>
    appointments
      .filter((item) => item.status !== "cancelled" && sameDay(item.startsAt, day))
      .sort((a, b) => a.startsAt - b.startsAt);

  const requests = appointments.filter((item) => item.status === "requested").sort((a, b) => a.startsAt - b.startsAt);
  const dayItems = selectedDay
    ? appointments
        .filter((item) => item.status !== "cancelled" && sameDay(item.startsAt, selectedDay))
        .sort((a, b) => a.startsAt - b.startsAt)
    : [];

  const invite = async () => {
    setBusy(true);
    setError("");
    try {
      await createAppointmentRequest({
        caseId,
        startsAt: new Date(startsAt).toISOString(),
        durationMinutes,
        reason,
        requestedBy: "doctor",
      });
      setInviteOpen(false);
      setReason("");
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not invite");
    } finally {
      setBusy(false);
    }
  };

  const act = async (id: string, action: "confirm" | "cancel" | "complete") => {
    setBusy(true);
    setError("");
    try {
      await patchAppointment(id, action);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update visit");
    } finally {
      setBusy(false);
    }
  };

  return (
        <DoctorChrome active="agenda" title="Agenda">
      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:pb-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full border border-black/10 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setView("week")}
                className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${view === "week" ? "bg-[#2f5f4f] text-white" : "text-[#2b2a28]"}`}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => setView("month")}
                className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${view === "month" ? "bg-[#2f5f4f] text-white" : "text-[#2b2a28]"}`}
              >
                Month
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                if (view === "month") {
                  if (!monthCursor) return;
                  const next = shiftMonth(monthCursor, -1);
                  setMonthCursor(next);
                  selectDay(next);
                  return;
                }
                if (!weekStart) return;
                const next = new Date(weekStart);
                next.setDate(next.getDate() - 7);
                selectDay(next);
              }}
              className="rounded-full border border-black/10 bg-white px-3 py-2 text-[13px] font-semibold"
            >
              Previous
            </button>
            <p className="min-w-[168px] text-center text-[13.5px] font-semibold text-[#1f241b]">
              {view === "month"
                ? monthCursor
                  ? monthCursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
                  : "Loading month…"
                : weekStart && days[6]
                  ? `${formatDay(weekStart)} – ${formatDay(days[6])}`
                  : "Loading week…"}
            </p>
            <button
              type="button"
              onClick={() => {
                if (view === "month") {
                  if (!monthCursor) return;
                  const next = shiftMonth(monthCursor, 1);
                  setMonthCursor(next);
                  selectDay(next);
                  return;
                }
                if (!weekStart) return;
                const next = new Date(weekStart);
                next.setDate(next.getDate() + 7);
                selectDay(next);
              }}
              className="rounded-full border border-black/10 bg-white px-3 py-2 text-[13px] font-semibold"
            >
              Next
            </button>
          </div>
          <button
            type="button"
            onClick={() => setInviteOpen((open) => !open)}
            className="rounded-full bg-[#2f5f4f] px-4 py-2.5 text-[13.5px] font-semibold text-white"
          >
            Invite to video call
          </button>
        </div>

        <CalendarGrid
          days={view === "week" ? days : monthDays}
          selectedDay={selectedDay}
          mutedMonth={view === "month" ? monthCursor : null}
          onSelect={selectDay}
          visibleAppointments={visibleAppointments}
        />

        {error ? <p className="mb-4 text-[13px] font-medium text-[#a81d12]">{error}</p> : null}

        {inviteOpen ? (
          <section className="mb-5 rounded-[16px] border border-[#cfe6d3] bg-[#eaf5ec] p-4 sm:p-5">
            <h2 className="mb-3 text-[15px] font-semibold text-[#1f241b]">Invite a patient</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-[13px] font-semibold text-[#1f241b]">
                Patient
                <select
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-[12px] border border-black/10 bg-white px-3.5 text-[13.5px] font-medium outline-none"
                >
                  <option value="">Select patient…</option>
                  {patients.map((patient) => (
                    <option key={patient.caseId} value={patient.caseId}>
                      {patient.fullName} · {patient.city}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[13px] font-semibold text-[#1f241b]">
                Date and time
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-[12px] border border-black/10 bg-white px-3.5 text-[13.5px] font-medium outline-none"
                />
              </label>
              <label className="text-[13px] font-semibold text-[#1f241b]">
                Length
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="mt-1.5 h-11 w-full rounded-[12px] border border-black/10 bg-white px-3.5 text-[13.5px] font-medium outline-none"
                >
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </label>
              <label className="text-[13px] font-semibold text-[#1f241b]">
                Reason
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Flagged answer to clarify, unusual pattern, side effect…"
                  className="mt-1.5 h-11 w-full rounded-[12px] border border-black/10 bg-white px-3.5 text-[13.5px] font-medium outline-none"
                />
              </label>
            </div>
            <button
              type="button"
              disabled={busy || !caseId || !startsAt}
              onClick={() => void invite()}
              className="mt-4 rounded-[12px] bg-[#2f5f4f] px-4 py-2.5 text-[13.5px] font-semibold text-white disabled:opacity-50"
            >
              Send invite
            </button>
          </section>
        ) : null}

        {requests.length > 0 ? (
          <section className="mb-5 rounded-[16px] border border-[#f0d7b0] bg-[#fff8ee] p-4 sm:p-5">
            <h2 className="mb-3 text-[15px] font-semibold text-[#1f241b]">Waiting for you to confirm</h2>
            <div className="space-y-3">
              {requests.map((item) => (
                <AppointmentCard
                  key={item.id}
                  item={item}
                  busy={busy}
                  onConfirm={() => void act(item.id, "confirm")}
                  onCancel={() => void act(item.id, "cancel")}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-[15px] font-semibold text-[#1f241b]">{selectedDay ? formatDay(selectedDay) : "Select a day"}</h2>
          {dayItems.map((item) => (
            <AppointmentCard
              key={item.id}
              item={item}
              busy={busy}
              onConfirm={() => void act(item.id, "confirm")}
              onCancel={() => void act(item.id, "cancel")}
              onComplete={() => void act(item.id, "complete")}
            />
          ))}
          {dayItems.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-black/10 bg-white px-6 py-12 text-center text-[14px] font-medium text-black/40">
              {loadError
                ? "Could not load the agenda. Is the local database running?"
                : "No video visits on this day. Invite a patient or confirm a request."}
            </div>
          ) : null}
        </section>
      </main>
    </DoctorChrome>
  );
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CalendarGrid({
  days,
  selectedDay,
  mutedMonth,
  onSelect,
  visibleAppointments,
}: {
  days: Date[];
  selectedDay: Date | null;
  mutedMonth: Date | null;
  onSelect: (day: Date) => void;
  visibleAppointments: (day: Date) => VideoAppointment[];
}) {
  return (
    <div className="mb-5 overflow-hidden rounded-[16px] bg-white">
      <div className="grid grid-cols-7" style={{ borderBottom: "1px solid #d8d5cc" }}>
        {WEEKDAYS.map((label, index) => {
          const weekend = index >= 5;
          return (
            <p
              key={label}
              className={`py-2 text-center text-[10px] font-semibold uppercase tracking-[0.04em] text-black/40 ${
                weekend ? "bg-[#f8f7f4]" : "bg-white"
              }`}
            >
              {label}
            </p>
          );
        })}
      </div>
      <div className="grid grid-cols-7" style={{ gap: 1, backgroundColor: "#d8d5cc" }}>
        {days.map((day) => {
          const items = visibleAppointments(day);
          const selected = sameDay(day.getTime(), selectedDay);
          const today = sameDay(Date.now(), day);
          const muted = mutedMonth ? !inMonth(day, mutedMonth) : false;
          const weekend = day.getDay() === 0 || day.getDay() === 6;
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelect(day)}
              className={`flex min-h-[78px] flex-col items-stretch justify-start px-1.5 py-1.5 text-left sm:min-h-[96px] sm:px-2 ${
                selected
                  ? "bg-[#eef4ea]"
                  : weekend
                    ? "bg-[#f8f7f4] hover:bg-[#f3f2ee]"
                    : "bg-white hover:bg-[#f7f6f3]"
              } ${muted && !selected ? "opacity-40" : ""}`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center self-end rounded-full text-[12px] font-semibold ${
                  selected ? "bg-[#3f5f35] text-white" : today ? "bg-[#e6f1e2] text-[#3f5f35]" : "text-[#1f241b]"
                }`}
              >
                {day.getDate()}
              </span>
              <div className="mt-1 w-full space-y-1">
                {items.slice(0, 2).map((item) => (
                  <p
                    key={item.id}
                    className={`truncate rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:text-[11px] ${
                      item.status === "requested" ? "bg-[#fff1dc] text-[#9a4e07]" : "bg-[#e6f1e2] text-[#3f5f35]"
                    }`}
                  >
                    {formatTime(item.startsAt)} {item.patientName.split(" ")[0]}
                  </p>
                ))}
                {items.length > 2 ? (
                  <p className="px-1 text-[10px] font-semibold text-black/40">+{items.length - 2} more</p>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AppointmentCard({
  item,
  busy,
  onConfirm,
  onCancel,
  onComplete,
}: {
  item: VideoAppointment;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onComplete?: () => void;
}) {
  const now = Date.now();
  const endsAt = item.startsAt + item.durationMinutes * 60_000;
  const canJoin = item.status === "scheduled" && now <= endsAt + 30 * 60_000;

  return (
    <article className="rounded-[16px] border border-black/[0.06] bg-white px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/doctor/patients/${item.caseId}`} className="text-[16px] font-semibold text-[#1f241b] hover:underline">
              {item.patientName}
            </Link>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusClass(item.status)}`}>
              {statusLabel(item.status)}
            </span>
          </div>
          <p className="mt-1 text-[13.5px] font-medium text-black/55">
            {formatTime(item.startsAt)} · {item.durationMinutes} min · {item.city}
          </p>
          {item.reason ? <p className="mt-1 text-[13.5px] text-[#1f241b]">{item.reason}</p> : null}
          {item.notes ? <p className="mt-1 line-clamp-2 text-[13px] text-black/50">{item.notes}</p> : null}
          <p className="mt-1 text-[12px] text-black/40">
            {item.requestedBy === "patient" ? "Requested by patient" : "Invited by physician"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.status === "requested" ? (
            <button type="button" disabled={busy} onClick={onConfirm} className="rounded-full bg-[#2f5f4f] px-3.5 py-2 text-[13px] font-semibold text-white disabled:opacity-50">
              Confirm
            </button>
          ) : null}
          {canJoin ? (
            <Link href={`/call/${item.id}`} className="rounded-full bg-[#2f5f4f] px-3.5 py-2 text-[13px] font-semibold text-white">
              Join call
            </Link>
          ) : null}
          {item.status === "scheduled" && onComplete && now > item.startsAt ? (
            <button type="button" disabled={busy} onClick={onComplete} className="rounded-full border border-black/10 bg-white px-3.5 py-2 text-[13px] font-semibold disabled:opacity-50">
              Mark complete
            </button>
          ) : null}
          {item.status === "requested" || item.status === "scheduled" ? (
            <button type="button" disabled={busy} onClick={onCancel} className="rounded-full border border-black/10 bg-white px-3.5 py-2 text-[13px] font-semibold disabled:opacity-50">
              Cancel
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function DoctorAgendaPage() {
  return (
    <Suspense fallback={<DoctorChrome active="agenda" title="Agenda"><main className="px-6 py-16 text-black/40">Loading agenda…</main></DoctorChrome>}>
      <AgendaPageInner />
    </Suspense>
  );
}
