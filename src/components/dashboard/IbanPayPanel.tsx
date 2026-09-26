"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { bankTransfer, formatIban, paymentQrPayload } from "@/lib/bank-transfer";
import type { PatientDashboardSnapshot } from "@/lib/patient-dashboard-types";

export function IbanPayPanel({
  snapshot,
  onUpdated,
}: {
  snapshot: PatientDashboardSnapshot;
  onUpdated: (next: PatientDashboardSnapshot) => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [qrSrc, setQrSrc] = useState("");
  const [copied, setCopied] = useState(false);
  const iban = bankTransfer.iban;
  const formatted = iban ? formatIban(iban) : "";

  useEffect(() => {
    if (!snapshot.paymentDue) return;
    const payload = paymentQrPayload(snapshot.paymentReference);
    if (!payload) {
      setQrSrc("");
      return;
    }
    let cancelled = false;
    void QRCode.toDataURL(payload, { margin: 1, width: 112, color: { dark: "#2b2a28", light: "#ffffff" } }).then((url) => {
      if (!cancelled) setQrSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [snapshot.paymentDue, snapshot.paymentReference]);

  if (snapshot.paymentDue) {
    const blocked = busy || !confirmed || !iban;
    return (
      <section
        id="pay"
        className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] bg-gradient-to-br from-[#c4715a] to-[#b8654f] p-4 text-white shadow-[0_8px_28px_rgba(196,113,90,0.28)]"
      >
        <p className="text-[12px] font-medium text-white/75">Next up</p>
        <h2 className="font-title text-[22px] font-medium leading-tight tracking-[0.01em] text-white">Send 750 TL</h2>
        <div className="mt-2.5 flex min-w-0 items-start gap-3">
          <div className="flex h-[84px] w-[84px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-white">
            {qrSrc ? (
              <img src={qrSrc} alt="" width={84} height={84} className="h-[84px] w-[84px]" />
            ) : (
              <p className="text-[10px] font-medium text-black/40">QR</p>
            )}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="truncate text-[14px] font-semibold leading-tight">{bankTransfer.accountName}</p>
            <p className="mt-1 font-mono text-[11px] font-semibold leading-snug tracking-[0.02em] text-white/90">
              {formatted || "—"}
            </p>
            <button
              type="button"
              onClick={() => {
                if (!iban) return;
                void navigator.clipboard.writeText(iban).then(() => {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1600);
                });
              }}
              disabled={!iban}
              className="mt-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white hover:bg-white/25 disabled:opacity-40"
            >
              {copied ? "Copied" : "Copy IBAN"}
            </button>
          </div>
        </div>
        <div className="mt-auto flex items-center gap-2 pt-3">
          <label className="flex min-w-0 flex-1 items-center gap-2 text-[12px] leading-none">
            <input
              type="checkbox"
              className="h-4 w-4 shrink-0 accent-white"
              checked={confirmed}
              onChange={(event) => {
                setConfirmed(event.target.checked);
                setError("");
              }}
            />
            <span className="truncate">I sent 750 TL</span>
          </label>
          <button
            type="button"
            disabled={blocked}
            onClick={() => {
              setBusy(true);
              setError("");
              void fetch("/api/payments/iban-confirm", { method: "POST" })
                .then(async (res) => {
                  const payload = (await res.json().catch(() => null)) as PatientDashboardSnapshot | { error?: string } | null;
                  if (!res.ok) {
                    setError((payload && "error" in payload && payload.error) || "Could not confirm. Try again.");
                    return;
                  }
                  onUpdated(payload as PatientDashboardSnapshot);
                })
                .catch(() => setError("Could not confirm. Try again."))
                .finally(() => setBusy(false));
            }}
            className="shrink-0 rounded-full bg-white px-3.5 py-2 text-[13px] font-semibold text-[#b8654f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "…" : "Confirm"}
          </button>
        </div>
        {error ? <p className="mt-1 text-[11px] font-medium text-white">{error}</p> : null}
      </section>
    );
  }

  return (
    <section
      id="pay"
      className="relative flex h-full min-h-0 flex-col overflow-y-auto rounded-[24px] bg-gradient-to-br from-[#c4715a] to-[#b8654f] p-4 text-white shadow-[0_8px_28px_rgba(196,113,90,0.28)]"
    >
      <p className="text-[12px] font-medium text-white/75">Next up</p>
      <h2 className="mt-0.5 font-title text-[22px] font-medium leading-tight tracking-[0.01em] text-white">
        {snapshot.paymentStatus === "captured" ? "750 TL received" : "We’ll match your transfer"}
      </h2>
      <p className="mt-1.5 text-[12px] leading-snug text-white/70">
        {snapshot.paymentStatus === "captured"
          ? "First month is on file. No need to send it again."
          : "You marked 750 TL as sent. We’ll match it to your name."}
      </p>
    </section>
  );
}
