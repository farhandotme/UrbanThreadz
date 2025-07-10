"use client"
import type { Metadata } from "next";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import { AuthActionProvider } from "@/components/AuthActionContext";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionWrapper>
      <AuthActionProvider>
        <ThemeProvider>
          <html lang="en">
            <body className="relative">
              {children}
            </body>
          </html>
        </ThemeProvider>
      </AuthActionProvider>
    </SessionWrapper>
  );
}