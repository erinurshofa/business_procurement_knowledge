import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Procurement Knowledge OS - AI-Powered Workspace",
  description:
    "AI-Powered Business Knowledge and Procurement Operating System for managing multi-tenant business data, experience repository, evidence vault, and automated document generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
