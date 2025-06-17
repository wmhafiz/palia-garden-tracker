import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Palia Garden Tracker - Real-time Crop Watering & Garden Management",
  description: "Track your Palia crops with real-time Palia clock, daily watering reminders, and garden planner integration. Never miss watering your crops again!",
  keywords: "Palia, garden, crops, watering, tracker, planner, game, farming",
  authors: [{ name: "Palia Garden Tracker" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#1f2937",
  openGraph: {
    title: "Palia Garden Tracker",
    description: "Track your Palia crops with real-time clock and watering reminders",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
