import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { DICT, LOCALES, hasLocale } from "@/data/site";
import SmoothScroll from "@/components/SmoothScroll";
import "../globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark" };

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = DICT[lang].meta;
  return {
    title: t.title,
    description: t.description,
    alternates: { languages: { "pt-BR": "/pt", en: "/en" } },
    openGraph: { title: t.title, description: t.description, type: "website", locale: lang === "pt" ? "pt_BR" : "en_US" },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <html lang={lang === "pt" ? "pt-BR" : "en"} className={`${geist.variable} ${geistMono.variable} ${bricolage.variable} antialiased`}>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
