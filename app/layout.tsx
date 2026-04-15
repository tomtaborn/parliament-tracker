import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://parliamenttracker.uk"),
  title: "Parliament Tracker — Select Committee Accountability",
  description:
    "Track how long the UK government has been ignoring select committee reports. Government departments ranked by overdue parliamentary responses.",
  openGraph: {
    title: "Parliament Tracker — Select Committee Accountability",
    description:
      "Government departments ranked by overdue parliamentary responses.",
    url: "https://parliamenttracker.uk",
    siteName: "Parliament Tracker",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Parliament Tracker — Select Committee Accountability",
    description:
      "Government departments ranked by overdue parliamentary responses.",
    images: ["/opengraph-image"],
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#C41E3A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={`${inter.variable} h-full`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAFAF8] text-[#1A1A18]">
        {children}
      </body>
    </html>
  );
}
