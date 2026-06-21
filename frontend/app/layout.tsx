import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aurora Travel Planner",
  description: "AI-powered travel planning platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} antialiased min-h-screen text-foreground relative`}
      >
        <div className="fixed inset-0 bg-background z-[-20]" />
        <div className="fixed inset-0 bg-topo-map z-[-10]" />
        <div className="fixed inset-0 bg-paper z-50 pointer-events-none" />
        <div className="relative z-0">
          {children}
        </div>
      </body>
    </html>
  );
}
