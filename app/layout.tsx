import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trivia Knights ⚔️ | Hizaki Labs",
  description:
    "A turn-based RPG where you defeat enemies by answering Gemini-powered trivia questions. Built for Hizaki Labs.",
  applicationName: "Trivia Knights",
  keywords: [
    "Trivia Knights",
    "Hizaki Labs",
    "Gemini",
    "Trivia",
    "RPG",
    "Game",
    "AI",
  ],
  authors: [{ name: "Ajxrhaider", url: "https://hizakilabs.com" }],
  creator: "Ajxrhaider",
  publisher: "Hizaki Labs",
  // Use a data-URL SVG to keep the route table clean — no .ico
  // references, so Next.js never tries to parse /favicon.ico.
  // The browser will use this data URL directly for the tab icon.
  icons: {
    icon: [
      {
        url:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230f172a'/%3E%3Cg stroke='%236366f1' stroke-width='4' stroke-linecap='round'%3E%3Cline x1='18' y1='18' x2='46' y2='46'/%3E%3Cline x1='46' y1='18' x2='18' y2='46'/%3E%3C/g%3E%3Cpath d='M22 52 L26 46 L32 50 L38 46 L42 52 Z' fill='%236366f1'/%3E%3C/svg%3E",
        type: "image/svg+xml",
      },
    ],
    shortcut: [
      {
        url:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%230f172a'/%3E%3Cpath d='M10 10 L22 22 M22 10 L10 22' stroke='%236366f1' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E",
        type: "image/svg+xml",
      },
    ],
  },
  openGraph: {
    title: "Trivia Knights ⚔️",
    description: "Defeat enemies with knowledge. Powered by Gemini.",
    type: "website",
    siteName: "Trivia Knights",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trivia Knights ⚔️",
    description: "Defeat enemies with knowledge. Powered by Gemini.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Google Fonts: Inter (body) + Space Grotesk (headings) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans text-secondary antialiased">{children}</body>
    </html>
  );
}
