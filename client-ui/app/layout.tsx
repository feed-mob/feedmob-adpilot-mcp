import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FeedMob AdPilot",
  description: "Chat interface with MCP tool support and interactive UI components",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
