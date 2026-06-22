import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "../components/Providers";
import { AuthGuard } from "../components/AuthGuard";
import { ThemeProvider } from "next-themes";

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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <AuthGuard>{children}</AuthGuard>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
