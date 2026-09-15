import type { DashboardTrackerStep } from "@/lib/patient-dashboard-types";

function StepIcon({ step }: { step: DashboardTrackerStep }) {
  if (step.status === "complete") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[#3d5c35]" stroke="currentColor" strokeWidth="2.4">
        <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (step.status === "active") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" stroke="currentColor" strokeWidth="1.6">
        <path d="M9 3h6v2.5h1.5A1.5 1.5 0 0 1 18 7v11a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 18V7a1.5 1.5 0 0 1 1.5-1.5H9V3Z" strokeLinejoin="round" />
        <path d="M9 7h6M10 11h4" strokeLinecap="round" />
      </svg>
    );
  }

  if (step.icon === "truck") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white/85" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 8h11v8H3V8Z" strokeLinejoin="round" />
        <path d="M14 10h3l2 3v3h-5v-6Z" strokeLinejoin="round" />
        <circle cx="7" cy="17" r="1.5" />
        <circle cx="17" cy="17" r="1.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white/85" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-5v-5H10v5H5a1 1 0 0 1-1-1v-7.5Z" strokeLinejoin="round" />
    </svg>
  );
}

function StepCircle({ step }: { step: DashboardTrackerStep }) {
  if (step.status === "complete") {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8dcc8]">
        <StepIcon step={step} />
      </div>
    );
  }

  if (step.status === "active") {
    return (
      <div className="animate-glow-pulse flex h-11 w-11 items-center justify-center rounded-full bg-[#e07a52]">
        <StepIcon step={step} />
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-[#162820]/70">
      <StepIcon step={step} />
    </div>
  );
}

export function OrderProgressTracker({ steps }: { steps: DashboardTrackerStep[] }) {
  const activeIndex = steps.findIndex((step) => step.status === "active");
  const completeCount = steps.filter((step) => step.status === "complete").length;
  const farthest = activeIndex >= 0 ? activeIndex : Math.max(0, completeCount - 1);
  const progress = steps.length > 1 ? farthest / (steps.length - 1) : 0;

  return (
    <div className="relative px-1 pb-1 pt-2">
      <div className="pointer-events-none absolute inset-x-[9%] top-2 flex h-11 items-center">
        <div className="relative w-full">
          <div className="border-t-2 border-dashed border-white/25" />
          <div className="absolute left-0 top-0 border-t-2 border-[#e8dcc8]" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <div className="relative flex justify-between">
        {steps.map((step) => (
          <div key={step.label} className="flex w-[18%] flex-col items-center">
            <div className="flex h-11 w-11 items-center justify-center">
              <StepCircle step={step} />
            </div>
            <div className="mt-2 flex h-8 flex-col items-center text-center">
              <span
                className={`leading-tight ${
                  step.status === "pending" ? "text-[11px] font-semibold text-white/90" : "text-[11px] font-semibold text-white"
                }`}
              >
                {step.label}
              </span>
              <span className="mt-0.5 h-[14px] text-[10px] font-normal leading-[14px] text-white/75">{step.date ?? "\u00a0"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
