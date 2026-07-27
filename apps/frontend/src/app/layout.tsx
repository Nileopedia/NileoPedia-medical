import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "../components/Providers";
import { AuthGuard } from "../components/AuthGuard";
import { ThemeProvider } from "../components/ThemeProvider";
import BackendBanner from "../components/BackendBanner";

export const metadata: Metadata = {
  title: "NileoPedia",
  description: "Medical Intelligence Platform",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col transition-colors duration-300">
        <BackendBanner />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <Providers>
            <AuthGuard>{children}</AuthGuard>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
