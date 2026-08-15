const steps = [
  { label: "Requested", status: "complete" as const, date: "May 20" },
  { label: "Approved", status: "complete" as const, date: "May 21" },
  { label: "Preparing", status: "active" as const, date: "May 22" },
  { label: "Shipped", status: "pending" as const, icon: "truck" as const },
  { label: "Delivered", status: "pending" as const, icon: "house" as const },
];

function StepIcon({ step }: { step: (typeof steps)[number] }) {
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

function StepCircle({ step }: { step: (typeof steps)[number] }) {
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

export function OrderProgressTracker() {
  return (
    <div className="relative px-1 pb-1 pt-2">
      <div className="absolute left-[9%] right-[9%] top-[26px]">
        <div className="border-t-2 border-dashed border-white/25" />
        <div className="absolute left-0 top-0 w-1/2 border-t-2 border-[#e8dcc8]" />
      </div>

      <div className="relative flex justify-between">
        {steps.map((step) => (
          <div key={step.label} className="flex w-[18%] flex-col items-center">
            <div className={`flex items-center justify-center ${step.status === "active" ? "h-11" : "h-9"}`}>
              <StepCircle step={step} />
            </div>
            <div className="mt-2 flex flex-col items-center gap-0.5 text-center">
              <span
                className={`leading-tight ${
                  step.status === "active"
                    ? "text-[11px] font-semibold text-white"
                    : step.status === "complete"
                      ? "text-[11px] font-semibold text-white"
                      : "text-[11px] font-semibold text-white/90"
                }`}
              >
                {step.label}
              </span>
              {"date" in step && step.date ? (
                <span className="text-[10px] font-normal text-white/75">{step.date}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
