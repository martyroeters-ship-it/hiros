"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { bankTransfer, formatIban, paymentQrPayload } from "@/lib/bank-transfer";

export type IbanTransferCopy = {
  notice: string;
  amount: string;
  amountHint: string;
  iban: string;
  copy: string;
  copied: string;
  scan: string;
  account: string;
  reference: string;
  referenceHint: string;
  confirmLabel: string;
  submitReview: string;
  demoNote: string;
  missingIban: string;
};

export function IbanTransferCard({
  copy,
  reference,
  requireConfirm = false,
  confirmed = false,
  onConfirmedChange,
  onContinue,
  continueDisabled = false,
  continueLabel,
  compact = false,
}: {
  copy: IbanTransferCopy;
  reference: string;
  requireConfirm?: boolean;
  confirmed?: boolean;
  onConfirmedChange?: (next: boolean) => void;
  onContinue: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
  compact?: boolean;
}) {
  const [qrSrc, setQrSrc] = useState("");
  const [copied, setCopied] = useState(false);
  const iban = bankTransfer.iban;
  const formatted = iban ? formatIban(iban) : "";
  const blocked = continueDisabled || (requireConfirm && (!confirmed || !iban));
  const qrSize = compact ? 140 : 200;

  useEffect(() => {
    const payload = paymentQrPayload(reference);
    if (!payload) {
      setQrSrc("");
      return;
    }
    let cancelled = false;
    void QRCode.toDataURL(payload, { margin: 1, width: qrSize, color: { dark: "#2b2a28", light: "#ffffff" } }).then((url) => {
      if (!cancelled) setQrSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [reference, qrSize]);

  async function copyIban() {
    if (!iban) return;
    await navigator.clipboard.writeText(iban);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-5"}>
      <div className={`flex items-center justify-between rounded-[16px] border border-[#CCD5C8] bg-[#E7EDE7] ${compact ? "px-4 py-3" : "px-4 py-4 sm:px-5 sm:py-5"}`}>
        <div>
          <p className="text-[13px] font-semibold tracking-[-0.01em] text-[#2D3A2F]/80">{copy.notice}</p>
          <p className="mt-1 text-[13px] font-medium text-[#2D3A2F]/70">{copy.amountHint}</p>
        </div>
        <p className={`font-semibold tracking-[-0.04em] text-[#2b2a28] ${compact ? "text-[22px]" : "text-[22px] sm:text-[28px]"}`}>{copy.amount}</p>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-black/8 bg-white/80 shadow-[0_10px_26px_rgba(0,0,0,0.04)]">
        <div className={`grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center ${compact ? "p-4" : "p-5 sm:p-6"}`}>
          <div
            className={`mx-auto flex items-center justify-center rounded-[16px] bg-[#fbfaf5] ring-1 ring-black/6 ${compact ? "h-[140px] w-[140px]" : "h-[200px] w-[200px]"}`}
          >
            {qrSrc ? (
              <img
                src={qrSrc}
                alt=""
                width={qrSize}
                height={qrSize}
                className={compact ? "h-[128px] w-[128px]" : "h-[184px] w-[184px]"}
              />
            ) : (
              <p className="max-w-[16ch] text-center text-[13px] font-medium leading-[1.4] text-black/45">{copy.missingIban}</p>
            )}
          </div>
          <div className="min-w-0 space-y-3">
            <p className="text-[13px] font-semibold tracking-[-0.01em] text-[#c77e57]">{copy.scan}</p>
            {bankTransfer.accountName ? (
              <div>
                <p className="text-[12px] font-medium text-black/45">{copy.account}</p>
                <p className="text-[16px] font-semibold tracking-[-0.02em] text-[#2b2a28]">
                  {bankTransfer.accountName}
                  {bankTransfer.bankName ? ` · ${bankTransfer.bankName}` : ""}
                </p>
              </div>
            ) : null}
            <div>
              <p className="text-[12px] font-medium text-black/45">{copy.iban}</p>
              <p className="break-words font-mono text-[15px] font-semibold tracking-[0.04em] text-[#2b2a28] sm:text-[16px]">
                {formatted || "—"}
              </p>
            </div>
            {reference ? (
              <div>
                <p className="text-[12px] font-medium text-black/45">{copy.reference}</p>
                <p className="text-[15px] font-semibold tracking-[-0.02em] text-[#2b2a28]">{reference}</p>
                <p className="mt-1 text-[12px] leading-[1.4] text-black/45">{copy.referenceHint}</p>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => void copyIban()}
              disabled={!iban}
              className="rounded-full border border-black/10 bg-[#fffef9] px-4 py-2 text-[13px] font-semibold text-[#2b2a28] hover:bg-white disabled:opacity-40"
            >
              {copied ? copy.copied : copy.copy}
            </button>
          </div>
        </div>
      </div>

      {requireConfirm ? (
        <label className="flex items-start gap-3 text-[14px] leading-[1.45] text-[#2b2a28]">
          <input
            type="checkbox"
            className="mt-1 h-[18px] w-[18px] cursor-pointer rounded border-[#c77e57]/60 text-[#2b2a28] accent-[#c77e57]"
            checked={confirmed}
            onChange={(event) => onConfirmedChange?.(event.target.checked)}
          />
          <span>{copy.confirmLabel}</span>
        </label>
      ) : null}

      <button
        type="button"
        className="w-full rounded-[20px] bg-[#0e1b24] py-3 text-[15px] font-semibold tracking-[-0.02em] text-white shadow-[0_10px_26px_rgba(0,0,0,0.08)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:py-4 sm:text-[16px]"
        disabled={blocked}
        onClick={onContinue}
      >
        {continueLabel ?? copy.submitReview}
      </button>

      <p className="text-center text-[12px] leading-[1.4] tracking-[-0.01em] text-black/55">{copy.demoNote}</p>
    </div>
  );
}
