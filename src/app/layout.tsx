import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";

import { siteConfig } from "@/config/site";
import { Providers } from "@/providers/Providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading-face",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} dark h-full antialiased`}
    >
      <body className="ambient-bg flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
