import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "./globals.css";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { defaultLocale } from "@/i18n/config";
import { Provider } from "./provider";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "Doable - Modern Team Task Management. Elevated.",
  description:
    "Built for teams who want to get things done. Clean, fast, and powerful task management with Swiss design principles. Free forever, open source.",
  keywords: [
    "task management",
    "team collaboration",
    "project management",
    "kanban",
    "agile",
    "productivity",
    "open source",
  ],
  authors: [{ name: "Kartik Labhshetwar" }],
  creator: "Kartik Labhshetwar",
  publisher: "Kartik Labhshetwar",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://doable-lyart.vercel.app/",
    siteName: "Doable",
    title: "Doable - Modern Team Task Management. Elevated.",
    description:
      "Built for teams who want to get things done. Clean, fast, and powerful task management with Swiss design principles.",
    images: [
      {
        url: "/open-graph.png",
        width: 1200,
        height: 630,
        alt: "Doable - Modern Team Task Management Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@code_kartik",
    creator: "@code_kartik",
    title: "Doable - Modern Team Task Management. Elevated.",
    description:
      "Built for teams who want to get things done. Clean, fast, and powerful task management with Swiss design principles. Free forever, open source.",
    images: ["/open-graph.png"],
  },
  alternates: {
    canonical: "https://doable-lyart.vercel.app/",
  },
  category: "productivity",
};

type RootLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
};

export default async function RootLayout({
  children,
  params,
}: Readonly<RootLayoutProps>) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale || defaultLocale;
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          data-website-id="158d23fd-3fec-46cb-a533-9f1136de3fe7"
          defer
          src="https://cloud.umami.is/script.js"
        />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <HydrationBoundary>
            <Provider>{children}</Provider>
          </HydrationBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
