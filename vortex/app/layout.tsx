import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vortex — AI Video Generator",
  description: "Generate AI videos from text prompts using Replicate's free models.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
