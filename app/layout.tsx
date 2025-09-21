import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Feedback Management System",
  description: "Enterprise feedback management for educational institutions",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "oklch(0.6 0.2 264)",
              colorBackground: "oklch(0.06 0 0)",
            },
          }}
        >
          <Suspense fallback={null}>{children}</Suspense>
          <Analytics />
        </ClerkProvider>
      </body>
    </html>
  );
}
