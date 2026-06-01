import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "../components/Providers";
import { AuthGuard } from "../components/AuthGuard";

export const metadata: Metadata = {
  title: "NileoPedia",
  description: "Medical Intelligence Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <AuthGuard>{children}</AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
