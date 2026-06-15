import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { ToastProvider } from "@/components/ui/toast";
import { TanstackQueryProvider } from "@/providers/tanstack-query";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Squad Scheduling",
  description: "Gestão de agendamentos em uma única plataforma",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={` ${inter.className} antialiased`}>
        <TanstackQueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
