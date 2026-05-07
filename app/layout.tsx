import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HubCorretor",
  description: "Sistema SaaS para corretores de saúde",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
