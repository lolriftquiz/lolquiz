import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoL Quiz",
  description: "League of Legends bilgi ve tahmin oyunu"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
