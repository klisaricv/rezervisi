import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rezervisi.to",
  description: "Moderna platforma za rezervaciju event usluga.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <body>{children}</body>
    </html>
  );
}
