import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Your Brand — Rental Alat Outdoor Terpercaya",
  description: "Sewa tenda, carrier, alat masak, penerangan, dan perlengkapan camping berkualitas untuk petualanganmu tanpa repot.",
  icons: {
    icon: "/yourbrand.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${spaceGrotesk.variable} ${inter.variable} min-h-screen`}
    >
      <body className="min-h-screen flex flex-col bg-[#F7F5EF] text-[#1E1E1A] antialiased">
        {children}
      </body>
    </html>
  );
}
