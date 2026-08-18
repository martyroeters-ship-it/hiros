"use client";

/* ─── shared primitives ──────────────────────────────────────────── */
function SectionHeader({ label }: { label: string }) {
  return <p className="mb-1.5 ml-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8a9288]">{label}</p>;
}
function Divider() { return <div className="ml-4 h-px bg-[#f0ebe2]" />; }
function Card({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-[16px] bg-white shadow-[0_1px_4px_rgba(31,51,41,0.06)]">{children}</div>;
}
function Row({ label, value, chevron = true }: { label: string; value?: string; chevron?: boolean }) {
  return (
    <button type="button" className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-[#f5f3ee] active:bg-[#edeae4]">
      <span className="text-[14px] font-medium text-[#1f3329]">{label}</span>
      <span className="flex items-center gap-2">
        {value && <span className="text-[14px] text-[#9aa396]">{value}</span>}
        {chevron && (
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-[#b0aba3]" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}

/* ─── page ───────────────────────────────────────────────────────── */
export default function ProfilePage() {
  return (
    <div className="overflow-y-auto pb-6 pr-1">
      <div className="mb-6">
        <p className="text-[12px] font-medium text-[#8a9288]">Your profile</p>
        <h1 className="font-title text-[24px] font-medium tracking-[-0.03em] text-[#1f3329] lg:text-[28px]">Account</h1>
      </div>

      {/* Profile card */}
      <div className="mb-6 flex items-center gap-4 rounded-[16px] bg-[#1f4033] px-5 py-4 shadow-[0_4px_20px_rgba(31,64,51,0.15)]">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20 text-[20px] font-semibold text-white">
          M
        </div>
        <div>
          <p className="text-[16px] font-semibold text-white">Martijn Roeters</p>
          <p className="text-[13px] text-white/60">martijn@example.com</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">

        <div>
          <SectionHeader label="Account" />
          <div className="flex flex-col gap-3">

            <Card>
              <div className="px-4 pb-1 pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#9aa396]">Personal information</p>
              </div>
              <Row label="Full name" value="Martijn Roeters" />
              <Divider />
              <Row label="Date of birth" value="Jun 12, 1990" />
              <Divider />
              <Row label="Email" value="martijn@example.com" />
              <Divider />
              <Row label="Phone number" value="+31 6 1234 5678" />
            </Card>

            <Card>
              <div className="px-4 pb-1 pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#9aa396]">Shipping address</p>
              </div>
              <Row label="Address" value="Keizersgracht 123" />
              <Divider />
              <Row label="City" value="Amsterdam" />
              <Divider />
              <Row label="Postal code" value="1015 CJ" />
            </Card>

            <Card>
              <div className="px-4 pb-1 pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#9aa396]">
                  Emergency contact <span className="normal-case font-normal text-[#b0aba3]">· optional</span>
                </p>
              </div>
              <Row label="Name" value="Not set" />
              <Divider />
              <Row label="Phone number" value="Not set" />
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}
