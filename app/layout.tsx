import type { Metadata } from "next";
import { Anton, Cormorant_Garamond, Inter, Roboto_Condensed } from "next/font/google";
import TargetMode from "@/components/target-mode/TargetMode";
import "./globals.css";

const anton = Anton({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const robotoCondensed = Roboto_Condensed({
  variable: "--font-condensed",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const title = "CriativAI \u2014 Creative Artificial Intelligence";
const description =
  "AI-powered products, intelligent automations, and custom software shaped by design, engineering, and business strategy.";

export const metadata: Metadata = {
  metadataBase: new URL("https://criativai.site"),
  title,
  description,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CriativAI",
    title,
    description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Creative Artificial Intelligence by CriativAI" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${anton.variable} ${inter.variable} ${cormorant.variable} ${robotoCondensed.variable}`}>
        {children}
        <TargetMode />
      </body>
    </html>
  );
}
