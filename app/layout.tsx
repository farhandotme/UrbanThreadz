import type { Metadata } from "next";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import { AuthActionProvider } from "@/components/AuthActionContext";

export const metadata: Metadata = {
  title: "UrbanThreadz",
  description: "Your one-stop shop for urban fashion and streetwear.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionWrapper>
      <AuthActionProvider>
        <html lang="en">
          <body className="relative">{children}</body>
        </html>
      </AuthActionProvider>
    </SessionWrapper>
  );
}