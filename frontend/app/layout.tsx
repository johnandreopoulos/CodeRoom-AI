import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CodeRoom AI",
  description: "Real-time collaborative coding with an AI senior reviewer"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
