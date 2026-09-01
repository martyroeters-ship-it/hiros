import type { Metadata } from "next";
import { DM_Sans, Geist, Geist_Mono } from "next/font/google";
import AppProviders from "@/components/AppProviders";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const shareImage = {
  url: "/og-icon.png",
  width: 256,
  height: 256,
  alt: "Hiros",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://hiros.com.tr"),
  title: "Hiros",
  description: "Kliniğe gitmeden, özel sağlık erişimi.",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    siteName: "Hiros",
    title: "Hiros",
    description: "Kliniğe gitmeden, özel sağlık erişimi.",
    images: [shareImage],
  },
  twitter: {
    card: "summary",
    title: "Hiros",
    description: "Kliniğe gitmeden, özel sağlık erişimi.",
    images: [shareImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full min-w-0 max-w-full flex-col overflow-x-clip">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
