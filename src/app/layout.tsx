import type { Metadata } from "next";
import { Libre_Caslon_Text, DM_Sans } from "next/font/google";
import "./globals.css";

const libreCaslon = Libre_Caslon_Text({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
});

const dmSans = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Restifashop — Premium Bedding & Sleep Essentials",
  description: "Quiet luxury bedding for the discerning home. Experience premium sprei, bedcovers, and sleep accessories crafted for ultimate comfort.",
  keywords: ["sprei", "bedcover", "selimut", "luxury bedding", "Restifashop"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${libreCaslon.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-on-background">
        {children}
      </body>
    </html>
  );
}
