export default function PhotosLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#f7f3ea] font-[var(--font-dm-sans)] text-[#2b2a28]">
      {children}
    </main>
  );
}
