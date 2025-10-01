import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Helicopter Tours Amman - Book Your Aerial Adventure",
  description: "Experience breathtaking aerial views of Amman, Madaba, and Jordan Valley. Book your helicopter tour today.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
