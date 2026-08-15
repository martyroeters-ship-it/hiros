export default function RecommendationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbf6f0] via-[#faf3ea] to-[#f5ede5]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#1b1b1b] px-3 py-1 text-sm font-semibold tracking-[-0.02em] text-white">hiros</span>
          </div>
        </div>

        <div className="rounded-[22px] border border-black/5 bg-white/80 p-4 shadow-[0_10px_26px_rgba(0,0,0,0.04)] backdrop-blur-[2px] sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
            <div className="lg:border-r lg:border-black/10 lg:pr-10">
              <h1 className="text-[36px] font-semibold leading-[1.06] tracking-[-0.06em] text-[#2b2a28] sm:text-[44px]">Based on your answers</h1>
              <p className="mt-4 text-[16px] leading-[1.55] tracking-[-0.02em] text-black/70">
                Based on the information you’ve provided, physicians reviewing similar cases often consider the following treatment options for male pattern hair loss.
              </p>
              <p className="mt-3 text-[15px] leading-[1.55] tracking-[-0.01em] text-black/62">
                Your physician will review your answers and photos before determining whether treatment is appropriate for you.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button type="button" className="inline-flex items-center justify-center rounded-full bg-[#1b1b1b] px-5 py-3 text-[15px] font-semibold tracking-[-0.02em] text-white shadow-sm hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40">
                  Continue
                </button>
                <button type="button" className="inline-flex items-center justify-center rounded-full border border-black/12 bg-white px-5 py-3 text-[15px] font-semibold tracking-[-0.02em] text-[#2b2a28] hover:bg-black/[0.03]">
                  Learn about other options
                </button>
              </div>

              <p className="mt-3 text-[12px] font-medium leading-[1.45] tracking-[-0.01em] text-black/46">
                No payment is collected unless treatment is approved.
              </p>
            </div>

            <div className="lg:pl-10">
              <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#c77e57]">Potential treatment pathway</p>

              <div className="mt-3 rounded-[18px] border border-black/10 bg-white p-5 shadow-[0_6px_18px_rgba(0,0,0,0.04)] sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[22px] font-semibold leading-[1.1] tracking-[-0.04em] text-[#2b2a28] sm:text-[24px]">Topical Finasteride + Minoxidil</h2>
                    <p className="mt-1 text-[14px] font-medium leading-[1.45] tracking-[-0.01em] text-black/60">Commonly prescribed for male pattern hair loss.</p>
                  </div>
                </div>

                <ul className="mt-4 space-y-2.5">
                  <li className="flex items-start gap-3 text-[14px] leading-[1.5] text-[#2b2a28]">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#c77e57]/10 text-[#c77e57]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <span>Topical finasteride is designed to reduce scalp DHT while limiting systemic exposure compared to oral finasteride.</span>
                  </li>
                  <li className="flex items-start gap-3 text-[14px] leading-[1.5] text-[#2b2a28]">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#c77e57]/10 text-[#c77e57]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <span>Clinical studies have demonstrated improvements in hair density and hair count in patients with androgenetic alopecia.</span>
                  </li>
                  <li className="flex items-start gap-3 text-[14px] leading-[1.5] text-[#2b2a28]">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#c77e57]/10 text-[#c77e57]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <span>Physician supervision helps determine whether topical or oral treatment is more appropriate for your situation.</span>
                  </li>
                </ul>

                <div className="mt-5 rounded-[14px] bg-[#faf7f2] p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#c77e57]">Estimated monthly cost</p>
                  <p className="mt-1 text-[20px] font-semibold tracking-[-0.03em] text-[#2b2a28]">€15–25 / month</p>
                </div>

                <div className="mt-4">
                  <a className="text-[14px] font-semibold tracking-[-0.01em] text-[#c77e57] underline decoration-transparent underline-offset-4 hover:decoration-[#c77e57]/40" href="#">More information</a>
                </div>

                <div className="mt-6">
                  <p className="text-[13px] font-semibold tracking-[-0.01em] text-[#2b2a28]">Included with your treatment</p>
                  <ul className="mt-3 space-y-2.5 text-[14px] text-[#2b2a28]">
                    <li className="flex items-start gap-3"><span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#5f7f4f]/10 text-[#5f7f4f]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 7c2-2.5 5-2.5 7 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M8 10v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="6" stroke="currentColor" strokeWidth="2"/><path d="M15 14l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span><span>Physician review</span></li>
                    <li className="flex items-start gap-3"><span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#5f7f4f]/10 text-[#5f7f4f]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 16l4-4 3 3 5-6 4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span><span>Progress tracking</span></li>
                    <li className="flex items-start gap-3"><span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#5f7f4f]/10 text-[#5f7f4f]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22c4-2 8-6 8-10a8 8 0 10-16 0c0 4 4 8 8 10z" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span><span>Side-effect monitoring</span></li>
                    <li className="flex items-start gap-3"><span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#5f7f4f]/10 text-[#5f7f4f]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 7v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span><span>Follow-up support</span></li>
                    <li className="flex items-start gap-3"><span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#5f7f4f]/10 text-[#5f7f4f]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M6 7l1.5-3h9L18 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><rect x="4" y="7" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2"/></svg></span><span>Discreet pharmacy delivery</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
