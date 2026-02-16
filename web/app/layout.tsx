import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent RAG Chat",
  description: "Chat interface for RAG-powered AI agent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
