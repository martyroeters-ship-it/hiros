"use client";

export function MessageUsButton() {
  const open = () => {
    document.getElementById("dashboard-care-chat-trigger")?.click();
  };

  return (
    <button
      type="button"
      onClick={open}
      className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#1f4033] px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
    >
      Message us
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
