export default function DoctorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-w-0 max-w-full overflow-x-hidden">{children}</div>;
}
