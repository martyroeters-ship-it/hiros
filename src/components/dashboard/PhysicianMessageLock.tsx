export function PhysicianMessageLock({ doctorName }: { doctorName?: string | null }) {
  return (
    <div className="rounded-[16px] border border-[#f0ebe2] bg-[#faf9f6] px-4 py-4">
      <p className="text-[13px] font-semibold text-[#1f3329]">Messaging your physician is included in Hiros Premium</p>
      <p className="mt-1.5 text-[12px] leading-relaxed text-[#6b7568]">
        Direct messages with {doctorName || "your physician"} are part of Premium. You can still book a call and reach the Hiros care team anytime.
      </p>
    </div>
  );
}
