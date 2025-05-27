import type { Metadata } from "next";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
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
      <html lang="en">
        <body className="relative">

          {children}
        </body>
      </html>
    </SessionWrapper>
  );
}