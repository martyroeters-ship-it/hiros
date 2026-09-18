import Link from "next/link";
import ProfilePage from "@/app/dashboard/(shell)/profile/page";

export default function CareSettingsProfilePage() {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/care/settings"
        className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-[var(--care-accent)]"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
          <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Settings
      </Link>
      <ProfilePage />
    </div>
  );
}
