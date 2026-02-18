import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Mindstar Technology - Advanced HRMS",
  description: "Enterprise-grade Human Resource Management System by Mindstar Technology",
  manifest: "/manifest.json",
  icons: { apple: "/icons/icon-192x192.png" },
};

export const viewport = {
  themeColor: "#135bec",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  shrinkToFit: "no",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
