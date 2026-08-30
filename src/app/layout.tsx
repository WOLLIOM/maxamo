import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { serif, sans } from "./fonts";
import { site } from "@/lib/site";
import { personSchema, websiteSchema } from "@/lib/schema";
import { Providers } from "@/components/providers/Providers";
import { Nav } from "@/components/layout/Nav";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { Footer } from "@/components/layout/Footer";
import { ExperienceShell } from "@/components/experience/ExperienceShell";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { ClickBurst } from "@/components/ui/ClickBurst";
import { PixelCursorField } from "@/components/ui/PixelCursorField";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Simon Maxam's Interactive Portfolio`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "Simon Maxam",
    "SIMAX",
    "game development",
    "Unreal Engine",
    "architecture",
    "3D design",
    "web development",
    "interactive portfolio",
    "guitar",
    "music",
  ],
  authors: [{ name: "Simon Maxam" }],
  creator: "Simon Maxam",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: `${site.name} — Simon Maxam's Interactive Portfolio`,
    description: site.description,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: `${site.name} — Simon Maxam`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Simon Maxam's Interactive Portfolio`,
    description: site.description,
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/icon.svg" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/manifest.webmanifest",
  category: "portfolio",
  // verification.google removed — was tied to the old restaurant-site domain.
  // Add a new Search Console token once SIMAX has its own domain.
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f2ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0c0e" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  viewportFit: "cover",
};

// Applies the saved theme (or the dark default) before paint to avoid a flash.
// Default is night/dark; visitors can switch and their choice is remembered.
const themeInit = `(function(){try{var p=localStorage.getItem("simax-theme");var t;if(p&&p!=="auto"){t=p;}else if(p==="auto"){var h=new Date().getHours();t=(h>=5&&h<17)?"morning":(h>=17&&h<21)?"evening":"night";}else{t="evening";}document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","evening");}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="evening"
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable}`}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInit}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
        />
      </head>
      <body>
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[10001] focus:rounded-full focus:bg-accent focus:px-5 focus:py-2 focus:text-sm focus:text-bg"
          >
            Skip to content
          </a>
          <Nav />
          <main id="main" className="pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
            {children}
          </main>
          <MobileBottomBar />
          <Footer />
          <ExperienceShell />
          <CustomCursor />
          <ClickBurst />
          <PixelCursorField />
        </Providers>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
