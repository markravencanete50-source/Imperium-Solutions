import type { Metadata } from "next";
import { Archivo, Montserrat } from "next/font/google";
import { site } from "@/lib/content";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: "800",
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Imperium Solutions | Managed support teams for your front office and back office",
    template: "%s | Imperium Solutions",
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "Imperium Solutions",
    description: site.description,
    images: ["/images/front.webp"],
  },
};

// Runs before first paint so motion styles apply without a flash.
const motionFlag = `(function(){var c=document.documentElement.classList;c.add('js');if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)c.add('reduce');})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionFlag }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
