"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Step = "prep" | "capture" | "done";
type CapturePhase = "top" | "front";

const prepPoints = [
  "Remove any hat or cap",
  "Stand in a well-lit area",
  "Pull your hair back so your hairline is visible",
];

export default function BaselinePhotosPage() {
  const [step, setStep] = useState<Step>("prep");
  const [isFading, setIsFading] = useState(false);

  // ── Prep animation ───────────────────────────────────────────
  const prepTitle = "Let's get you ready.";
  const [prepTitleChars, setPrepTitleChars] = useState(0);
  const prepTitleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [prepVisible, setPrepVisible] = useState(0);
  const [prepButtonVisible, setPrepButtonVisible] = useState(false);

  // ── Done animation ───────────────────────────────────────────
  const doneTitle = "You're all set.";
  const doneSubStatic = "Your physician will use these photos as a ";
  const doneSubTyped = "baseline to track your progress over time.";
  const [doneTitleChars, setDoneTitleChars] = useState(0);
  const [doneSubVisible, setDoneSubVisible] = useState(false);
  const [doneSubTypedChars, setDoneSubTypedChars] = useState(0);
  const [doneButtonVisible, setDoneButtonVisible] = useState(false);
  const doneIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneButtonTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Camera ───────────────────────────────────────────────────
  const [phase, setPhase] = useState<CapturePhase>("top");
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraReadyConfirmed, setCameraReadyConfirmed] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flashVisible, setFlashVisible] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Transition helper ────────────────────────────────────────
  const goTo = (next: Step) => {
    setIsFading(true);
    setTimeout(() => { setStep(next); setIsFading(false); }, 150);
  };

  // ── Prep animation ───────────────────────────────────────────
  useEffect(() => {
    if (step !== "prep") return;
    setPrepTitleChars(0);
    setPrepVisible(0);
    setPrepButtonVisible(false);

    prepTitleIntervalRef.current = setInterval(() => {
      setPrepTitleChars((c) => {
        if (c >= prepTitle.length) {
          if (prepTitleIntervalRef.current) clearInterval(prepTitleIntervalRef.current);
          return c;
        }
        return c + 1;
      });
    }, 30);

    const titleDuration = (prepTitle.length / 2) * 18 + 100;
    const timers = prepPoints.map((_, i) =>
      setTimeout(() => setPrepVisible((v) => Math.max(v, i + 1)), titleDuration + i * 600)
    );
    const btnTimer = setTimeout(() => setPrepButtonVisible(true), titleDuration + prepPoints.length * 600 + 200);
    return () => {
      if (prepTitleIntervalRef.current) clearInterval(prepTitleIntervalRef.current);
      timers.forEach(clearTimeout);
      clearTimeout(btnTimer);
    };
  }, [step, prepTitle.length]);

  // ── Done typewriter ──────────────────────────────────────────
  useEffect(() => {
    if (step !== "done") return;
    setDoneTitleChars(0);
    setDoneSubVisible(false);
    setDoneSubTypedChars(0);
    setDoneButtonVisible(false);

    // 1. Type the title
    doneIntervalRef.current = setInterval(() => {
      setDoneTitleChars((c) => {
        if (c >= doneTitle.length) {
          if (doneIntervalRef.current) clearInterval(doneIntervalRef.current);
          // 2. After title, show static first line instantly
          doneButtonTimeoutRef.current = setTimeout(() => {
            setDoneSubVisible(true);
            // 3. Then type "baseline…"
            let typed = 0;
            doneIntervalRef.current = setInterval(() => {
              typed += 1;
              setDoneSubTypedChars(typed);
              if (typed >= doneSubTyped.length) {
                if (doneIntervalRef.current) clearInterval(doneIntervalRef.current);
                doneButtonTimeoutRef.current = setTimeout(() => setDoneButtonVisible(true), 300);
              }
            }, 30);
          }, 120);
          return c;
        }
        return c + 1;
      });
    }, 30);
    return () => {
      if (doneIntervalRef.current) clearInterval(doneIntervalRef.current);
      if (doneButtonTimeoutRef.current) clearTimeout(doneButtonTimeoutRef.current);
    };
  }, [step, doneTitle.length, doneSubTyped.length]);

  // ── Camera helpers ───────────────────────────────────────────
  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) clearTimeout(countdownRef.current);
    setCountdown(null);
  }, []);

  const clearFlash = useCallback(() => {
    if (flashRef.current) clearTimeout(flashRef.current);
    setFlashVisible(false);
  }, []);

  const captureFrame = useCallback(() => {
    const v = videoRef.current;
    if (!v || v.videoWidth === 0) return null;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth; canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.92);
  }, []);

  // ── Start camera ─────────────────────────────────────────────
  useEffect(() => {
    if (step !== "capture") {
      setCameraLoading(false); setCameraReady(false); setCameraReadyConfirmed(false);
      setCapturedImage(null); setCameraError(null); setCountdown(null);
      clearCountdown(); clearFlash(); stopStream();
      return;
    }

    let cancelled = false;
    setCameraLoading(true); setCameraReady(false); setCameraReadyConfirmed(false);
    setCapturedImage(null); setCameraError(null);

    (async () => {
      try {
        let stream: MediaStream;
        try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "user" } }, audio: false }); }
        catch { stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); }
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}); }
        setCameraReady(true);
        readyDelayRef.current = setTimeout(() => { if (!cancelled) setCameraReadyConfirmed(true); }, 650);
      } catch {
        if (!cancelled) setCameraError("We couldn't access your camera. Please allow camera access in your browser settings.");
      } finally {
        if (!cancelled) setCameraLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      clearCountdown(); clearFlash();
      if (readyDelayRef.current) clearTimeout(readyDelayRef.current);
      stopStream();
    };
  }, [step, sessionKey, clearCountdown, clearFlash, stopStream]);

  // ── Camera capture handler ───────────────────────────────────
  const handleCapture = () => {
    if (capturedImage !== null || cameraError !== null) {
      if (phase === "top") {
        clearCountdown(); clearFlash();
        if (readyDelayRef.current) clearTimeout(readyDelayRef.current);
        stopStream();
        setCapturedImage(null); setCameraError(null);
        setCameraReady(false); setCameraReadyConfirmed(false);
        setPhase("front");
        setSessionKey((k) => k + 1);
      } else {
        goTo("done");
      }
      return;
    }

    setCountdown(3);
    const tick = (v: number) => {
      countdownRef.current = setTimeout(() => {
        if (v > 1) { setCountdown(v - 1); tick(v - 1); }
        else {
          setCountdown(null);
          const img = captureFrame();
          if (img) {
            setFlashVisible(true);
            flashRef.current = setTimeout(() => setFlashVisible(false), 120);
            setCapturedImage(img);
          }
        }
      }, 900);
    };
    tick(3);
  };

  const handleRetake = () => {
    clearCountdown(); clearFlash();
    if (readyDelayRef.current) clearTimeout(readyDelayRef.current);
    stopStream();
    setCapturedImage(null); setCameraError(null);
    setCameraReady(false); setCameraReadyConfirmed(false);
    setSessionKey((k) => k + 1);
  };

  const canCaptureContinue = cameraError !== null || capturedImage !== null || (cameraReadyConfirmed && countdown === null);
  const captureButtonLabel =
    cameraError ? "Continue" :
    capturedImage ? (phase === "top" ? "Looks good" : "Continue") :
    countdown !== null ? "Capturing…" : "Capture photo";

  const phaseInstruction = phase === "top" ? "Tilt your head down slightly" : "Align your face in the center";

  return (
    <div className={`flex min-h-screen w-full flex-col transition-opacity duration-150 ${isFading ? "opacity-0" : "opacity-100"}`}>

      {/* ── Top bar ── */}
      {step !== "done" && (
        <div className="flex items-center justify-end px-8 pt-8">
          <div className="flex items-center gap-1.5">
            {(["prep", "capture"] as Step[]).map((s, i) => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${step === s ? "w-6 bg-[#c77e57]" : i < ["prep","capture"].indexOf(step) ? "w-1.5 bg-[#c77e57]/40" : "w-1.5 bg-black/15"}`} />
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════ PREP ═══════════════════════════ */}
      {step === "prep" && (
        <div className="flex flex-1 items-center justify-center px-8 py-12">
          <div className="flex w-full max-w-[34rem] flex-col gap-14">
            <div className="space-y-10">
              <div className="relative">
                <h1 className="invisible text-[34px] font-medium leading-[1.08] tracking-[-0.06em] sm:text-[48px]">{prepTitle}</h1>
                <h1 className="absolute inset-0 text-[34px] font-medium leading-[1.08] tracking-[-0.06em] text-[#c77e57] sm:text-[48px]">
                  {prepTitle.slice(0, prepTitleChars)}
                </h1>
              </div>
              <div className="space-y-6 sm:space-y-7">
                {prepPoints.map((point, i) => (
                  <div key={point} className={`flex items-start gap-4 transition-all duration-500 ${i < prepVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7d9a68] via-[#6f8f5a] to-[#557546] text-white shadow-[0_6px_14px_rgba(95,127,79,0.2)]">
                      <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
                        <path d="M5.5 10.25 8.5 13.25 14.5 6.75" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <p className="text-[20px] font-medium leading-[1.24] tracking-[-0.04em] text-[#2b2a28] sm:text-[24px]">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex min-h-[72px] w-full items-end">
              <button
                type="button"
                onClick={() => goTo("capture")}
                disabled={!prepButtonVisible}
                className={`w-full max-w-[500px] rounded-full px-6 py-4 text-[16px] font-medium tracking-[-0.03em] transition-all duration-300 ${prepButtonVisible ? "translate-y-0 bg-[#11110f] text-white opacity-100" : "translate-y-2 opacity-0"}`}
              >
                I am ready
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════ CAPTURE ════════════════════════ */}
      {step === "capture" && (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
          <p className="mb-4 text-[13px] font-semibold tracking-[-0.01em] text-[#c77e57]">
            {phase === "top" ? "Photo 1 of 2 — Top of head" : "Photo 2 of 2 — Front facing"}
          </p>

          <div className="w-full overflow-hidden rounded-[30px] bg-[#ece4d7] shadow-[0_24px_60px_rgba(0,0,0,0.12)] sm:w-[60vw] sm:max-w-[820px]">
            <div className="relative h-[74vh] min-h-[540px] max-h-[900px] w-full bg-[#e7ddcf]">

              {capturedImage ? (
                <img src={capturedImage} alt="Captured preview" className="h-full w-full object-cover" />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay playsInline muted
                  style={{ transform: cameraReady ? "scaleX(-1) scale(1.03)" : "scaleX(-1)" }}
                  className={`h-full w-full object-cover transition-all duration-700 ${cameraReady ? "opacity-100" : "opacity-0"}`}
                />
              )}

              {cameraLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#e7ddcf] text-center text-[#7a6c5d]">
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#c77e57]/30 border-t-[#c77e57]" />
                  <p className="px-6 text-[15px] font-medium tracking-[-0.02em]">Opening your camera…</p>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#e7ddcf] px-8 text-center">
                  <p className="max-w-[22rem] text-[15px] font-medium leading-[1.45] tracking-[-0.02em] text-[#7a6c5d]">{cameraError}</p>
                </div>
              )}

              <div className={`pointer-events-none absolute inset-0 z-20 bg-white transition-opacity duration-100 ${flashVisible ? "opacity-100" : "opacity-0"}`} />

              {!capturedImage && !cameraError && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/48 via-black/18 to-transparent px-6 pb-6 pt-24 text-center">
                  {countdown !== null ? (
                    <div className="flex h-full -translate-y-12 items-center justify-center">
                      <span className="text-[50px] font-semibold tracking-[-0.06em] text-white sm:text-[61px]">{countdown}</span>
                    </div>
                  ) : (
                    <p className={`text-[16px] font-medium tracking-[-0.02em] text-white transition-opacity duration-300 sm:text-[17px] ${countdown !== null ? "opacity-0" : "opacity-100"}`}>
                      {phaseInstruction}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCapture}
            disabled={!canCaptureContinue}
            className={`mx-auto mt-6 block w-full max-w-[360px] rounded-full px-6 py-4 text-[16px] font-medium tracking-[-0.03em] transition-colors sm:max-w-[380px] ${canCaptureContinue ? "bg-[#11110f] text-white" : "bg-black/10 text-black/30"}`}
          >
            {captureButtonLabel}
          </button>

          {capturedImage && (
            <button type="button" onClick={handleRetake} className="mx-auto mt-3 block text-[14px] font-medium tracking-[-0.02em] text-black/60 underline underline-offset-[3px] hover:text-black/80">
              Retake photo
            </button>
          )}
        </div>
      )}

      {/* ══════════════════════════ DONE ═══════════════════════════ */}
      {step === "done" && (
        <div className="flex flex-1 items-center justify-center px-8">
          <div className="flex w-full max-w-[34rem] flex-col items-start gap-10">
            <svg viewBox="0 0 132 132" className="h-[88px] w-[88px] drop-shadow-sm" aria-hidden="true">
              <circle cx="66" cy="66" r="60" fill="none" stroke="#9cc796" strokeWidth="6" />
              <path d="M40 68 L60 86 L96 50" fill="none" stroke="#5f7f4f" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="180" strokeDashoffset="180">
                <animate attributeName="stroke-dashoffset" from="180" to="0" dur="0.8s" begin="0.15s" fill="freeze" />
              </path>
            </svg>

            <div className="space-y-6">
              {/* Title */}
              <div className="relative">
                <p className="invisible text-[34px] font-medium leading-[1.08] tracking-[-0.06em] sm:text-[48px]">{doneTitle}</p>
                <p className="absolute inset-0 text-[34px] font-medium leading-[1.08] tracking-[-0.06em] text-[#c77e57] sm:text-[48px]">
                  {doneTitle.slice(0, doneTitleChars)}
                </p>
              </div>

              {/* Subtitle — line 1 static, line 2 typed */}
              <div className={`text-[22px] font-medium leading-[1.35] tracking-[-0.03em] text-[#c77e57] transition-opacity duration-300 sm:text-[28px] ${doneSubVisible ? "opacity-100" : "opacity-0"}`}>
                <span>{doneSubStatic}</span>
                <br />
                <span>{doneSubTyped.slice(0, doneSubTypedChars)}</span>
              </div>
            </div>

            {/* What's next */}
            <div className={`w-full space-y-4 transition-all duration-500 ${doneButtonVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#c77e57]/60">What's next?</p>
              <ul className="space-y-3">
                {[
                  "Continue your treatment as prescribed",
                  "We'll remind you when it's time for progress photos",
                  "You can message your physician at any time",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7d9a68] to-[#557546] text-white">
                      <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3">
                        <path d="M5.5 10.25 8.5 13.25 14.5 6.75" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <p className="text-[17px] font-medium leading-[1.35] tracking-[-0.02em] text-[#2b2a28]/80">{item}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex min-h-[56px] w-full items-end">
              <Link
                href="/dashboard"
                className={`w-full max-w-[500px] rounded-full bg-[#11110f] px-6 py-4 text-center text-[16px] font-medium tracking-[-0.03em] text-white transition-all duration-300 hover:bg-[#2b2a28] ${doneButtonVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 pointer-events-none"}`}
              >
                Continue to dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
