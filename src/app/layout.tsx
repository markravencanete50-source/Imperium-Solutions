import type { Metadata } from "next";
import { Archivo, Montserrat } from "next/font/google";
import { site } from "@/lib/content";
import { ogImageAlt, ogImageUrl } from "@/lib/seo/config";
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
  applicationName: site.name,
  title: {
    default: "Imperium Solutions | Managed Support and Back Office Teams",
    template: "%s | Imperium Solutions",
  },
  description: site.description,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    title: "Imperium Solutions | Managed Support and Back Office Teams",
    description: site.description,
    images: [{ url: ogImageUrl, width: 1200, height: 630, alt: ogImageAlt }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Imperium Solutions | Managed Support and Back Office Teams",
    description: site.description,
    images: [{ url: ogImageUrl, alt: ogImageAlt }],
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
