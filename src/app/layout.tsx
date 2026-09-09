import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import { StoreHydration } from "@/components/store-hydration";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sejny Casino",
  description:
    "Glass lobby, daily chest, 3D collectible cards, and polished mini games.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full antialiased">
        <StoreHydration>{children}</StoreHydration>
      </body>
    </html>
  );
}
