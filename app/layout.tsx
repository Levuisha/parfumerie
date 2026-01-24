import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FragranceProvider } from "@/context/FragranceContext";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Parfumerie - Fragrance Library & Discovery",
  description: "Your personal fragrance library and discovery platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FragranceProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </FragranceProvider>
      </body>
    </html>
  );
}
