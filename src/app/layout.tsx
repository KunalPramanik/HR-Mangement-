import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Mindstar HR Portal",
  description: "Employee management and HR portal for Mindstar Technology",
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
