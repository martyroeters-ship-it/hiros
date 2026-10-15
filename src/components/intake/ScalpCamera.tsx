"use client";

import { useEffect, useRef, useState } from "react";
import { SCALP_VIEWS, type ScalpViewId } from "./scalp-views";

type GuidanceId =
  | "noFace"
  | "closer"
  | "back"
  | "center"
  | "moveLeft"
  | "moveRight"
  | "moveUp"
  | "moveDown"
  | "checking"
  | "upright"
  | "straight"
  | "turnRight"
  | "turnLeft"
  | "turnBack"
  | "chinDown"
  | "chinUp"
  | "showScalp"
  | "dim"
  | "bright"
  | "hold"
  | "fillGuide"
  | "capturing"
  | "ready";

type ViewCopy = {
  title: string;
  instruction: string;
  hint: string;
  review?: string;
};

export type ScalpCameraCopy = {
  step: string;
  views: Record<ScalpViewId, ViewCopy>;
  guidance: Record<GuidanceId, string>;
  review: string;
  captureNow: string;
  manual: string;
  opening: string;
  unsupported: string;
  access: string;
  captureFail: string;
  looksGood: string;
  retake: string;
};

type Props = {
  copy: ScalpCameraCopy;
  isFading: boolean;
  onComplete: (photos: Record<ScalpViewId, string>) => void;
};

type Pose = {
  yaw: number;
  pitch: number;
  roll: number;
  eyeDist: number;
  faceHeight: number;
  cx: number;
  cy: number;
};

const WASM_BASE = "/mediapipe/wasm";
const MODEL_PATH = "/models/face_landmarker.task";
const STABLE_MS = 2000;

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function sampleFrame(video: HTMLVideoElement) {
  const canvas = document.createElement("canvas");
  canvas.width = 24;
  canvas.height = 32;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let luminance = 0;
  for (let index = 0; index < data.length; index += 4) {
    luminance += data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722;
  }
  return { luminance: luminance / (data.length / 4), pixels: data };
}

function frameDelta(current: Uint8ClampedArray, previous: Uint8ClampedArray | null) {
  if (!previous || previous.length !== current.length) return Number.POSITIVE_INFINITY;
  let total = 0;
  const samples = current.length / 4;
  for (let index = 0; index < current.length; index += 4) {
    total += Math.abs(current[index] - previous[index]);
  }
  return total / samples;
}

function poseFromLandmarks(landmarks: { x: number; y: number }[]): Pose | null {
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const nose = landmarks[1];
  const forehead = landmarks[10];
  const chin = landmarks[152];
  if (!leftEye || !rightEye || !nose || !forehead || !chin) return null;

  const eyeDist = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y);
  if (eyeDist < 0.01) return null;
  const midX = (leftEye.x + rightEye.x) / 2;
  const midY = (leftEye.y + rightEye.y) / 2;

  return {
    yaw: (nose.x - midX) / eyeDist,
    pitch: (nose.y - midY) / eyeDist,
    roll: Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x),
    eyeDist,
    faceHeight: Math.abs(chin.y - forehead.y),
    cx: (Math.min(leftEye.x, rightEye.x, forehead.x) + Math.max(leftEye.x, rightEye.x, chin.x)) / 2,
    cy: (forehead.y + chin.y) / 2,
  };
}

/** Visible slice of the camera frame after object-cover, so checks match the oval on screen. */
function visibleFrame(video: HTMLVideoElement) {
  const elementAspect = video.clientWidth / Math.max(video.clientHeight, 1);
  const videoAspect = video.videoWidth / Math.max(video.videoHeight, 1);
  if (videoAspect > elementAspect) {
    const width = elementAspect / videoAspect;
    return { x0: (1 - width) / 2, y0: 0, width, height: 1 };
  }
  const height = videoAspect / Math.max(elementAspect, 0.01);
  return { x0: 0, y0: (1 - height) / 2, width: 1, height };
}

function guidanceForPose(view: ScalpViewId, pose: Pose, brightness: number, video: HTMLVideoElement): GuidanceId | null {
  const frame = visibleFrame(video);
  const displayX = 1 - (pose.cx - frame.x0) / frame.width;
  const displayY = (pose.cy - frame.y0) / frame.height;
  const displayHeight = pose.faceHeight / frame.height;
  const offsetX = displayX - 0.5;
  // Front sits a little lower in the frame. Temples stay on the original line.
  const offsetY = displayY - (view === "front" ? 0.56 : 0.48);
  const isTemple = view === "left" || view === "right";

  if (view === "left") {
    if (pose.yaw > -0.14) return "turnRight";
    if (pose.yaw < -1.05) return "turnBack";
  } else if (view === "right") {
    if (pose.yaw < 0.14) return "turnLeft";
    if (pose.yaw > 1.05) return "turnBack";
  }

  if (displayHeight < (isTemple ? 0.36 : 0.38)) return "closer";
  if (displayHeight > (isTemple ? 0.52 : 0.5)) return "back";
  if (Math.abs(offsetX) > (isTemple ? 0.11 : 0.045) || Math.abs(offsetY) > (isTemple ? 0.11 : 0.05)) {
    if (Math.abs(offsetX) >= Math.abs(offsetY)) return offsetX > 0 ? "moveLeft" : "moveRight";
    return offsetY > 0 ? "moveUp" : "moveDown";
  }
  if (Math.abs(pose.roll) > (isTemple ? 0.22 : 0.1)) return "upright";

  if (brightness < 48) return "dim";
  if (brightness > 220) return "bright";
  return null;
}

/** Top of head is valid once the face has dropped out of the frame. */
function scalpGuidance(pose: Pose | null, moved: number, brightness: number): GuidanceId | null {
  if (brightness < 48) return "dim";
  if (brightness > 220) return "bright";
  // A readable face means this is still a portrait, not the crown or top of the head.
  if (pose && (pose.cy < 0.8 || pose.pitch < 1.25)) return "showScalp";
  if (moved > 12) return "hold";
  return null;
}

function captureMirroredFrame(video: HTMLVideoElement) {
  if (video.videoWidth === 0 || video.videoHeight === 0) return null;
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.translate(canvas.width, 0);
  context.scale(-1, 1);
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.92);
}

const ARROW_TURNS: Partial<Record<GuidanceId, number>> = {
  moveLeft: 180,
  turnLeft: 180,
  moveRight: 0,
  turnRight: 0,
  moveUp: -90,
  chinUp: -90,
  moveDown: 90,
  chinDown: 90,
  showScalp: 90,
};

function GuidanceArrow({ id }: { id: GuidanceId }) {
  const turn = ARROW_TURNS[id];
  if (turn === undefined) return null;
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" style={{ transform: `rotate(${turn}deg)` }} aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ScalpCamera({ copy, isFading, onComplete }: Props) {
  const [viewIndex, setViewIndex] = useState(0);
  const [sessionKey, setSessionKey] = useState(0);
  const [phase, setPhase] = useState<"live" | "review">("live");
  const [still, setStill] = useState<string | null>(null);
  const [approved, setApproved] = useState<Partial<Record<ScalpViewId, string>>>({});
  const [guidance, setGuidance] = useState<GuidanceId>("noFace");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState<"loading" | "on" | "off">("loading");
  const [error, setError] = useState<string | null>(null);
  const [marker, setMarker] = useState<{ x: number; y: number } | null>(null);
  const [holdSeconds, setHoldSeconds] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<{
    detectForVideo: (video: HTMLVideoElement, timestamp: number) => { faceLandmarks: { x: number; y: number }[][] };
    close: () => void;
  } | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimestampRef = useRef(0);
  const stableSinceRef = useRef<number | null>(null);
  const previousPixelsRef = useRef<Uint8ClampedArray | null>(null);
  const capturingRef = useRef(false);
  const guidanceRef = useRef<GuidanceId>("noFace");

  const view = SCALP_VIEWS[viewIndex];
  const viewCopy = copy.views[view.id];
  const stepLabel = copy.step.replace("{current}", String(viewIndex + 1)).replace("{total}", String(SCALP_VIEWS.length));

  useEffect(() => {
    let cancelled = false;

    const loadLandmarker = async () => {
      try {
        const vision = await import("@mediapipe/tasks-vision");
        const fileset = await vision.FilesetResolver.forVisionTasks(WASM_BASE);
        const options = {
          baseOptions: { modelAssetPath: MODEL_PATH, delegate: "GPU" as const },
          runningMode: "VIDEO" as const,
          numFaces: 1,
        };
        let landmarker: { close: () => void; detectForVideo: (video: HTMLVideoElement, timestamp: number) => { faceLandmarks: { x: number; y: number }[][] } };
        try {
          landmarker = await vision.FaceLandmarker.createFromOptions(fileset, options);
        } catch {
          landmarker = await vision.FaceLandmarker.createFromOptions(fileset, {
            ...options,
            baseOptions: { ...options.baseOptions, delegate: "CPU" },
          });
        }
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;
        setTracking("on");
      } catch {
        if (!cancelled) setTracking("off");
      }
    };

    void loadLandmarker();

    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (phase !== "live") {
      stopStream(streamRef.current);
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setLoading(false);
      setError(copy.unsupported);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setReady(false);
    capturingRef.current = false;
    stableSinceRef.current = null;
    previousPixelsRef.current = null;

    const start = async () => {
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "user" } },
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }
        if (cancelled) {
          stopStream(stream);
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => undefined);
        }
        if (!cancelled) setLoading(false);
      } catch {
        if (!cancelled) {
          setLoading(false);
          setError(copy.access);
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      stopStream(streamRef.current);
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [copy.access, copy.unsupported, phase, sessionKey]);

  useEffect(() => {
    if (phase !== "live" || loading || error) return;

    const setGuide = (next: GuidanceId, isReady: boolean, seconds: number | null = null) => {
      if (guidanceRef.current !== next) {
        guidanceRef.current = next;
        setGuidance(next);
      }
      setHoldSeconds((current) => (current === seconds ? current : seconds));
      setReady(isReady);
    };

    const takePhoto = () => {
      if (capturingRef.current) return;
      const video = videoRef.current;
      if (!video) return;
      const frame = captureMirroredFrame(video);
      if (!frame) {
        setError(copy.captureFail);
        return;
      }
      capturingRef.current = true;
      setGuide("capturing", true);
      setStill(frame);
      setPhase("review");
    };

    let lastDetect = 0;
    const openedAt = performance.now();
    const tick = (now: number) => {
      rafRef.current = window.requestAnimationFrame(tick);
      if (now - lastDetect < 120 || capturingRef.current) return;
      lastDetect = now;

      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0) return;

      const sample = sampleFrame(video);
      if (!sample) return;
      const moved = frameDelta(sample.pixels, previousPixelsRef.current);
      previousPixelsRef.current = sample.pixels;

      let issue: GuidanceId | null = null;

      if (view.tracksFace && tracking === "on" && landmarkerRef.current) {
        try {
          const timestamp = Math.max(now, lastTimestampRef.current + 1);
          lastTimestampRef.current = timestamp;
          const result = landmarkerRef.current.detectForVideo(video, timestamp);
          const landmarks = result.faceLandmarks[0];
          const pose = landmarks ? poseFromLandmarks(landmarks) : null;
          if (!pose) {
            issue = "noFace";
            setMarker(null);
          } else {
            issue = guidanceForPose(view.id, pose, sample.luminance, video);
            const nextMarker = { x: 1 - pose.cx, y: pose.cy };
            setMarker((current) =>
              current && Math.hypot(current.x - nextMarker.x, current.y - nextMarker.y) < 0.012 ? current : nextMarker,
            );
          }
        } catch {
          setTracking("off");
          setMarker(null);
          issue = "noFace";
        }
      } else if (tracking === "loading") {
        issue = "checking";
      } else if (!view.tracksFace && tracking === "on" && landmarkerRef.current) {
        try {
          const timestamp = Math.max(now, lastTimestampRef.current + 1);
          lastTimestampRef.current = timestamp;
          const result = landmarkerRef.current.detectForVideo(video, timestamp);
          const landmarks = result.faceLandmarks[0];
          const pose = landmarks ? poseFromLandmarks(landmarks) : null;
          issue = scalpGuidance(pose, moved, sample.luminance);
          if (pose && issue === "showScalp") {
            const nextMarker = { x: 1 - pose.cx, y: pose.cy };
            setMarker((current) =>
              current && Math.hypot(current.x - nextMarker.x, current.y - nextMarker.y) < 0.012 ? current : nextMarker,
            );
          } else {
            setMarker(null);
          }
        } catch {
          setTracking("off");
          setMarker(null);
          issue = "showScalp";
        }
      } else if (!view.tracksFace) {
        issue = "showScalp";
      } else {
        issue = null;
      }

      if (!view.tracksFace && now - openedAt < 2500) {
        stableSinceRef.current = null;
        setGuide(issue ?? "fillGuide", false);
        return;
      }

      const canAuto = view.tracksFace ? tracking === "on" && issue === null : issue === null;
      if (!canAuto) {
        stableSinceRef.current = null;
        setGuide(issue ?? "fillGuide", false);
        return;
      }

      if (stableSinceRef.current === null) stableSinceRef.current = now;
      const held = now - stableSinceRef.current;
      if (held < STABLE_MS) {
        setGuide("hold", false, Math.ceil((STABLE_MS - held) / 1000));
        return;
      }

      setGuide("capturing", true);
      takePhoto();
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafRef.current);
  }, [copy.captureFail, error, loading, phase, tracking, view]);

  const captureManually = () => {
    if (capturingRef.current) return;
    const video = videoRef.current;
    if (!video) return;
    const frame = captureMirroredFrame(video);
    if (!frame) {
      setError(copy.captureFail);
      return;
    }
    capturingRef.current = true;
    setStill(frame);
    setPhase("review");
  };

  const approve = () => {
    if (!still) return;
    const nextApproved = { ...approved, [view.id]: still };
    setApproved(nextApproved);
    if (viewIndex === SCALP_VIEWS.length - 1) {
      onComplete(nextApproved as Record<ScalpViewId, string>);
      return;
    }
    setStill(null);
    setPhase("live");
    setViewIndex((current) => current + 1);
    setSessionKey((current) => current + 1);
    guidanceRef.current = view.tracksFace ? "noFace" : "fillGuide";
    setGuidance(guidanceRef.current);
    setReady(false);
  };

  const retake = () => {
    capturingRef.current = false;
    setStill(null);
    setPhase("live");
    setSessionKey((current) => current + 1);
    setReady(false);
  };

  const showManual = phase === "live" && !error && !loading && tracking === "off";
  const guideIsGood = guidance === "hold" || guidance === "capturing";

  return (
    <div className={`mx-auto flex h-full min-h-0 w-full max-w-[1080px] flex-col items-center transition-opacity duration-150 ease-out ${isFading ? "opacity-0" : "opacity-100"}`}>
      <div className="flex h-full min-h-0 w-full flex-col items-center">
        <p className="mb-1 shrink-0 text-[13px] font-medium tracking-[-0.02em] text-black/45">{stepLabel}</p>
        <h2 className="shrink-0 text-center font-title text-[22px] font-medium tracking-[-0.04em] text-[#c77e57] sm:text-[26px]">
          {viewCopy.title}
        </h2>
        <p className="mb-2 max-w-[28rem] shrink-0 px-6 text-center text-[14px] font-medium leading-[1.35] tracking-[-0.02em] text-black/55">
          {phase === "review" ? (viewCopy.review ?? copy.review) : viewCopy.instruction}
        </p>

        <div className="mx-auto flex min-h-0 w-full max-w-[720px] flex-1 overflow-hidden rounded-[24px] bg-[#ece4d7] shadow-[0_24px_60px_rgba(0,0,0,0.12)] sm:rounded-[30px]">
          <div className="relative min-h-0 w-full flex-1 overflow-hidden rounded-[24px] bg-[#e7ddcf] sm:rounded-[30px] [transform:translateZ(0)]">
            {phase === "review" && still ? (
              <img src={still} alt="" className="h-full w-full rounded-[24px] object-cover sm:rounded-[30px]" />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full rounded-[24px] object-cover transition-opacity duration-700 sm:rounded-[30px] ${loading || error ? "opacity-0" : "opacity-100"}`}
                style={{ transform: "scaleX(-1)" }}
              />
            )}

            {phase === "live" && !error ? (
              <div className={`pointer-events-none absolute inset-0 flex items-center justify-center ${view.id === "front" ? "translate-y-[6%]" : ""}`}>
                {view.shape === "face" ? (
                  <div
                    className={`h-[62%] w-[46%] max-w-[280px] rounded-[50%] border-2 border-dashed transition-colors duration-300 ${guideIsGood ? "border-[#d7e7c8]/70" : "border-white/45"}`}
                  />
                ) : (
                  <div
                    className={`h-[46%] w-[58%] max-w-[340px] rounded-[46%] border-2 border-dashed transition-colors duration-300 ${guideIsGood ? "border-[#d7e7c8]/70" : "border-white/45"}`}
                  />
                )}
              </div>
            ) : null}

            {phase === "live" && marker ? (
              <div
                className="pointer-events-none absolute z-10 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50 bg-white/10 shadow-[0_0_0_5px_rgba(255,255,255,0.12)]"
                style={{ left: `${marker.x * 100}%`, top: `${marker.y * 100}%` }}
              />
            ) : null}

            {loading && phase === "live" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#e7ddcf] text-center text-[#7a6c5d]">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#c77e57]/30 border-t-[#c77e57]" aria-hidden="true" />
                <p className="px-6 text-[15px] font-medium tracking-[-0.02em]">{copy.opening}</p>
              </div>
            ) : null}

            {error ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#e7ddcf] px-8 text-center">
                <p className="max-w-[22rem] text-[15px] font-medium leading-[1.45] tracking-[-0.02em] text-[#7a6c5d]">{error}</p>
              </div>
            ) : null}

            {phase === "live" && !error && !loading ? (
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-4 pt-4">
                <div
                  className={`flex max-w-[22rem] items-center gap-2 rounded-full px-4 py-3 text-white shadow-[0_10px_30px_rgba(0,0,0,0.28)] ${guideIsGood ? "bg-[#3d6b32]" : "bg-black/75"}`}
                  aria-live="polite"
                >
                  {guidance === "hold" && holdSeconds !== null ? (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-[16px] font-semibold">
                      {holdSeconds}
                    </span>
                  ) : (
                    <GuidanceArrow id={guidance} />
                  )}
                  <p className="text-left text-[16px] font-semibold leading-tight tracking-[-0.02em] sm:text-[18px]">
                    {copy.guidance[guidance]}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {phase === "live" && !error && viewCopy.hint ? (
          <p className="mx-auto mt-2 max-w-[32rem] shrink-0 px-4 text-center text-[13px] font-medium leading-[1.35] tracking-[-0.02em] text-[#1f241b]">
            {viewCopy.hint}
          </p>
        ) : null}

        {phase === "review" ? (
          <button
            type="button"
            onClick={approve}
            className="mx-auto mt-3 block w-full max-w-[360px] shrink-0 rounded-full bg-[#11110f] px-5 py-3 text-[15px] font-medium tracking-[-0.03em] text-white sm:max-w-[380px] sm:px-6 sm:text-[16px]"
          >
            {copy.looksGood}
          </button>
        ) : showManual ? (
          <button
            type="button"
            onClick={captureManually}
            className="mx-auto mt-3 block w-full max-w-[360px] shrink-0 rounded-full bg-[#11110f] px-5 py-3 text-[15px] font-medium tracking-[-0.03em] text-white sm:max-w-[380px] sm:px-6 sm:text-[16px]"
          >
            {copy.captureNow}
          </button>
        ) : null}

        {phase === "review" ? (
          <button
            type="button"
            onClick={retake}
            className="mx-auto mt-3 block text-[14px] font-medium tracking-[-0.02em] text-black/68 underline underline-offset-[3px]"
          >
            {copy.retake}
          </button>
        ) : null}

        {tracking === "off" && phase === "live" && view.tracksFace ? (
          <p className="mx-auto mt-3 max-w-[28rem] px-6 text-center text-[13px] font-medium leading-[1.4] text-black/50">{copy.manual}</p>
        ) : null}
      </div>
    </div>
  );
}
