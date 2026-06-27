import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "アート×英語コラボレッスン | NEIRO Language House",
  description: "子ども向け「アート×英語」コラボレッスンの予約サイトです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F7F8FA] text-[#1A1A1A] font-sans">
        {children}
      </body>
    </html>
  );
}
