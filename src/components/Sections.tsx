import Link from "next/link";
import { CATEGORIES, EXPERIENCE, PROFILE, PROJECTS, SKILLS, type CategoryId, type Dict, type Locale } from "@/data/site";
import { LOGOS } from "@/data/logos";
import CopyEmail from "./CopyEmail";

const Kicker = ({ children }: { children: React.ReactNode }) => (
  <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
    <span className="text-accent">●</span> {children}
  </p>
);

export function Nav({ lang, t }: { lang: Locale; t: Dict["nav"] }) {
  const links = [
    ["#sobre", t.about],
    ["#experiencia", t.experience],
    ["#projetos", t.projects],
    ["#contato", t.contact],
  ] as const;
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-black/70 backdrop-blur-md">
      <a href="#sobre" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-black">
        {t.skip}
      </a>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <a href="#top" className="font-display text-lg font-extrabold tracking-tight">
          LG<span className="text-accent">.</span>
        </a>
        <ul className="hidden items-center gap-8 text-sm text-fg/75 md:flex">
          {links.map(([href, label]) => (
            <li key={href}>
              <a href={href} className="transition hover:text-fg">{label}</a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1 rounded-full border border-line p-1 font-mono text-xs" aria-label="Idioma / Language">
          {(["pt", "en"] as const).map((l) => (
            <Link
              key={l}
              href={`/${l}`}
              hrefLang={l}
              aria-current={l === lang ? "page" : undefined}
              className={`rounded-full px-2.5 py-1 uppercase transition ${l === lang ? "bg-fg text-black" : "text-muted hover:text-fg"}`}
            >
              {l}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

export function Marquee({ words }: { words: string[] }) {
  const row = [...words, ...words];
  return (
    <div className="overflow-hidden border-y border-line py-5" aria-hidden>
      <div className="marquee-track flex w-max gap-10 whitespace-nowrap font-display text-3xl font-extrabold uppercase tracking-tight md:text-5xl">
        {[...row, ...row].map((w, i) => (
          <span key={i} className={i % 2 ? "text-fg/25" : "text-fg"}>
            {w} <span className="text-accent">✳</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function About({ lang, t }: { lang: Locale; t: Dict["about"] }) {
  const groups = (Object.keys(CATEGORIES) as CategoryId[]).map((c) => ({
    c,
    label: CATEGORIES[c][lang],
    items: SKILLS.filter((s) => s.category === c),
  }));
  return (
    <section id="sobre" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <Kicker>{t.kicker}</Kicker>
      <div className="mt-6 grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-5xl">{t.title}</h2>
          <div className="mt-8 max-w-2xl space-y-5 text-base leading-relaxed text-fg/75 md:text-lg">
            <p>{t.p1}</p>
            <p>{t.p2}</p>
          </div>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{t.stackTitle}</p>
          <dl className="mt-4 divide-y divide-line border-y border-line">
            {groups.map((g) => (
              <div key={g.c} className="grid gap-2 py-4 sm:grid-cols-[10rem_1fr]">
                <dt className="text-sm text-muted">{g.label}</dt>
                <dd className="flex flex-wrap gap-x-4 gap-y-2">
                  {g.items.map((s) => (
                    <span key={s.id} className="inline-flex items-center gap-1.5 text-sm">
                      <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden>
                        <path d={LOGOS[s.logo].path} fill="currentColor" />
                      </svg>
                      {s.name}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export function Experience({ lang, t }: { lang: Locale; t: Dict["experience"] }) {
  return (
    <section id="experiencia" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <Kicker>{t.kicker}</Kicker>
      <h2 className="mt-6 font-display text-4xl font-bold tracking-tight md:text-6xl">{t.title}</h2>
      <ol className="mt-12 border-t border-line">
        {EXPERIENCE.map((e) => (
          <li key={e.company} className="grid gap-4 border-b border-line py-8 md:grid-cols-[12rem_1fr_1.4fr] md:gap-10">
            <p className="font-mono text-sm text-muted">{e.period[lang]}</p>
            <div>
              <p className="font-display text-2xl font-bold">
                {e.url ? (
                  <a href={e.url} target="_blank" rel="noreferrer" className="transition hover:text-accent">
                    {e.company} <span className="text-base text-muted">↗</span>
                  </a>
                ) : (
                  e.company
                )}
              </p>
              <p className="mt-1 text-sm text-fg/75">{e.role[lang]}</p>
              {e.place && <p className="mt-1 font-mono text-xs text-muted">{e.place[lang]}</p>}
            </div>
            <ul className="space-y-2.5 text-sm leading-relaxed text-fg/75">
              {e.bullets[lang].map((b) => (
                <li key={b} className="flex gap-3">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <div className="mt-16">
        <Kicker>{t.education}</Kicker>
        <div className="mt-6 grid gap-2 border-y border-line py-6 md:grid-cols-[12rem_1fr] md:gap-10">
          <p className="font-mono text-sm text-muted">{t.degreeStatus}</p>
          <div>
            <p className="font-display text-xl font-bold">{t.degree}</p>
            <p className="mt-1 text-sm text-fg/75">{t.school}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Projects({ lang, t }: { lang: Locale; t: Dict["projects"] }) {
  return (
    <section id="projetos" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <Kicker>{t.kicker}</Kicker>
      <h2 className="mt-6 font-display text-4xl font-bold tracking-tight md:text-6xl">{t.title}</h2>
      <ul className="mt-12 grid gap-5 md:grid-cols-2">
        {PROJECTS.map((p, i) => (
          <li
            key={p.name}
            className={`group relative flex min-h-[18rem] flex-col justify-between rounded-3xl border p-7 transition ${
              p.soon ? "border-dashed border-line text-fg/50" : "border-line bg-white/[0.03] hover:border-fg/40"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
              {p.soon && <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider">{t.soon}</span>}
            </div>
            <div>
              <p className={`font-display text-3xl font-bold md:text-4xl ${p.soon ? "" : "text-fg"}`}>
                {p.href ? (
                  <a href={p.href} target="_blank" rel="noreferrer" className="after:absolute after:inset-0 after:rounded-3xl group-hover:text-accent transition">
                    {p.name}
                  </a>
                ) : (
                  p.name
                )}
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed">{p.desc[lang]}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {p.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px]">{tag}</span>
                ))}
                {!p.soon && (
                  p.href ? (
                    <span aria-hidden className="ml-auto text-sm font-semibold text-accent">{t.visit} ↗</span>
                  ) : (
                    <span className="ml-auto font-mono text-[11px] text-muted">{t.private}</span>
                  )
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Contact({ t, footer }: { t: Dict["contact"]; footer: string }) {
  const links = [
    { label: "LinkedIn", href: PROFILE.linkedin },
    { label: "WhatsApp", href: PROFILE.whatsapp },
    ...(PROFILE.github ? [{ label: "GitHub", href: PROFILE.github }] : []),
  ];
  return (
    <section id="contato" className="border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-36">
        <Kicker>{t.kicker}</Kicker>
        <h2 className="mt-6 font-display text-[clamp(2.8rem,9vw,7.5rem)] leading-[0.9] tracking-tight">
          <span className="font-light">{t.titleA} </span>
          <span className="font-extrabold">{t.titleB}</span>
          <br />
          <span className="font-light">{t.titleC} </span>
          <span className="font-extrabold text-accent">{t.titleD}</span>
        </h2>
        <p className="mt-8 max-w-xl text-fg/75">{t.sub}</p>
        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <a href={`mailto:${PROFILE.email}`} className="break-all font-display text-2xl font-bold underline decoration-line decoration-2 underline-offset-8 transition hover:decoration-accent md:text-4xl">
              {PROFILE.email}
            </a>
            <div className="mt-3">
              <CopyEmail email={PROFILE.email} label={t.copy} done={t.copied} />
            </div>
          </div>
          <ul className="flex flex-wrap gap-3">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noreferrer" className="inline-block rounded-full border border-line px-5 py-2.5 text-sm font-semibold transition hover:border-fg">
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 font-mono text-xs text-muted md:flex-row md:justify-between md:px-8">
          <p>© 2026 {PROFILE.name} · {PROFILE.location}</p>
          <p>{footer}</p>
        </div>
      </footer>
    </section>
  );
}
