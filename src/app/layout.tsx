// app/layout.tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { VoiceProvider } from "@/context/VoiceContext";

// Load Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // Optional: include desired font weights
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Made by Jaiman Soni",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <VoiceProvider>{children}</VoiceProvider>
      </body>
    </html>
  );
}
