import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Poppins, Montserrat } from "next/font/google"
import NextAuthSessionProvider from "@/providers/sessionProvider";
import ToastProvider from "@/toast/ToastProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins"
})

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat"
})

export const metadata: Metadata = {
  title: "Medflow",
  description: "O site que cuida da sua agenda de saúde!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable, montserrat.variable} antialiased`}>
        <ToastProvider>
          <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
