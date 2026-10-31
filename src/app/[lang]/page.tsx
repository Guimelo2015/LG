import { notFound } from "next/navigation";
import Hero, { type HeroKey } from "@/components/Hero";
import { About, Contact, Experience, Marquee, Nav, Projects } from "@/components/Sections";
import { CATEGORIES, DICT, SKILLS, hasLocale } from "@/data/site";
import { LOGOS } from "@/data/logos";

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = DICT[lang];

  const keys: HeroKey[] = [
    ...SKILLS.map((s) => ({
      id: s.id,
      name: s.name,
      category: CATEGORIES[s.category][lang],
      desc: s.desc[lang],
      logoPath: LOGOS[s.logo].path,
      hex: LOGOS[s.logo].hex,
    })),
    { id: "space", name: t.keyboard.space, category: t.keyboard.spaceCat, desc: t.keyboard.spaceDesc, logoPath: null, hex: "#c8ff3d", wide: true },
  ];

  return (
    <>
      <Nav lang={lang} t={t.nav} />
      <main>
        <Hero hero={t.hero} kb={t.keyboard} keys={keys} />
        <Marquee words={t.marquee} />
        <About lang={lang} t={t.about} />
        <Experience lang={lang} t={t.experience} />
        <Projects lang={lang} t={t.projects} />
        <Contact t={t.contact} footer={t.footer} />
      </main>
    </>
  );
}
