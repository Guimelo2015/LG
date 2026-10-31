"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SandEngine, type KeyRect, type KeyState } from "@/lib/sand/engine";
import type { Dict } from "@/data/site";

export type HeroKey = {
  id: string;
  name: string;
  category: string;
  desc: string;
  logoPath: string | null;
  hex: string | null;
  wide?: boolean;
};

type Mode = { cols: number; cell: number; push: boolean; animate: boolean; touch: boolean };

const ACCENT = "#c8ff3d";

function readMode(): Mode {
  const desktop = window.matchMedia("(min-width: 768px)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;
  // a areia roda sempre, inclusive com "reduzir movimento" ativo (decisão do autor do site)
  return { cols: desktop ? 6 : 5, cell: desktop ? 2 : 3, push: fine, animate: true, touch: !fine };
}

export default function Hero({ hero, kb, keys }: { hero: Dict["hero"]; kb: Dict["keyboard"]; keys: HeroKey[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const staticRef = useRef<HTMLCanvasElement>(null);
  const sandRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SandEngine | null>(null);

  const [rects, setRects] = useState<KeyRect[]>([]);
  const [mode, setMode] = useState<Mode | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [states, setStates] = useState<Record<string, { s: KeyState; t: number }>>({});

  // modo (desktop/mobile, reduzir movimento) — reavaliado quando as media queries mudam
  useEffect(() => {
    const update = () => setMode((m) => {
      const n = readMode();
      return m && m.cols === n.cols && m.cell === n.cell && m.push === n.push && m.animate === n.animate ? m : n;
    });
    update();
    const qs = ["(min-width: 768px)", "(pointer: fine)"].map((q) => window.matchMedia(q));
    qs.forEach((q) => q.addEventListener("change", update));
    return () => qs.forEach((q) => q.removeEventListener("change", update));
  }, []);

  // motor
  useEffect(() => {
    if (!mode) return;
    const host = hostRef.current!, slot = slotRef.current!;
    const engine = new SandEngine(
      host, slot, staticRef.current!, sandRef.current!,
      keys.map((k) => ({ id: k.id, logoPath: k.logoPath, hex: k.hex, wide: k.wide })),
      { cols: mode.cols, cell: mode.cell, push: mode.push, animate: mode.animate, accent: ACCENT },
      (id, s) => setStates((prev) => ({ ...prev, [id]: { s, t: performance.now() } })),
    );
    engineRef.current = engine;

    let lastW = 0, lastH = 0, timer = 0;
    const relayout = () => {
      const r = host.getBoundingClientRect();
      if (Math.abs(r.width - lastW) < 1 && Math.abs(r.height - lastH) < 1) return;
      setRects(engine.layout());
      const r2 = host.getBoundingClientRect();
      lastW = r2.width;
      lastH = r2.height;
    };
    const first = requestAnimationFrame(relayout);
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = window.setTimeout(relayout, 140);
    });
    ro.observe(host);

    const io = new IntersectionObserver(([e]) => engine.setVisible(e.isIntersecting), { threshold: 0 });
    io.observe(host);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = host.getBoundingClientRect();
      engine.pointer(e.clientX - r.left, e.clientY - r.top);
    };
    const onLeave = () => engine.pointerLeave();
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    // fontes carregadas podem mudar a altura do texto -> refaz o layout
    document.fonts?.ready.then(() => { lastW = 0; relayout(); });

    return () => {
      cancelAnimationFrame(first);
      ro.disconnect();
      io.disconnect();
      clearTimeout(timer);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      engine.destroy();
      engineRef.current = null;
    };
  }, [mode, keys]);

  const press = useCallback((id: string, e: React.MouseEvent) => {
    setActive(id);
    const engine = engineRef.current;
    if (!engine || !mode?.animate) return;
    if (id === "space") {
      engine.explodeAll();
      return;
    }
    const r = hostRef.current!.getBoundingClientRect();
    // clique via teclado (Enter/Espaço) chega com detail === 0: estoura a partir do centro
    if (e.detail === 0) engine.explode(id);
    else engine.explode(id, e.clientX - r.left, e.clientY - r.top);
  }, [mode]);

  const activeKey = keys.find((k) => k.id === active) ?? null;
  const activeState = active ? states[active] : undefined;
  const falling = activeState?.s === "fallen";

  return (
    <section
      ref={hostRef}
      id="top"
      className="relative isolate min-h-svh overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* camadas de simulação (atrás do texto, sem capturar o mouse) */}
      <canvas ref={staticRef} aria-hidden className="pointer-events-none absolute left-0 top-0 -z-10" />
      <canvas ref={sandRef} aria-hidden className="pointer-events-none absolute left-0 top-0 -z-10 [image-rendering:pixelated]" />

      {/* mobile: texto → teclado → card (card logo abaixo do teclado). desktop: texto+card | teclado */}
      <div className="mx-auto grid min-h-svh max-w-7xl grid-cols-1 gap-x-14 gap-y-8 px-5 pb-40 pt-28 md:px-8 lg:grid-cols-[1fr_1.3fr] lg:pb-44">
        <div className="relative z-10 flex flex-col gap-6 lg:col-start-1 lg:row-start-1 lg:self-end">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{hero.eyebrow}</p>
          <h1 id="hero-title" className="font-display text-[clamp(2.5rem,6.4vw,5rem)] leading-[0.92] tracking-tight">
            <span className="font-light">{hero.titleA} </span>
            <span className="font-extrabold">{hero.titleB}</span>
            <br />
            <span className="font-light">{hero.titleC} </span>
            <span className="font-extrabold text-accent">{hero.titleD}</span>
          </h1>
          <p className="font-mono text-sm text-fg/80">{hero.lead}</p>
        </div>

        <div className="relative lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          {/* o slot define onde o teclado é desenhado; a altura é calculada pelo motor */}
          <div ref={slotRef} className="aspect-[6.7/5] w-full md:aspect-[6.7/4.9]" role="group" aria-label={kb.label} />
        </div>
        <div className="relative z-10 flex flex-col gap-6 lg:col-start-1 lg:row-start-2 lg:self-start">
          {/* card de informação da skill — fica fora do teclado para não cobrir o desmanche */}
          <div
            className="relative h-[11.5rem] overflow-hidden rounded-2xl md:h-[11rem] border border-line bg-black/75 p-5 backdrop-blur-sm"
            aria-live="polite"
          >
            {activeKey ? (
              <div key={activeKey.id} className="animate-[fadeUp_.35s_ease-out]">
                <div className="flex items-center gap-3">
                  {activeKey.logoPath && (
                    <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden>
                      <path d={activeKey.logoPath} fill={activeKey.hex && activeKey.hex !== "#000000" && activeKey.hex !== "#181717" ? activeKey.hex : "#fff"} />
                    </svg>
                  )}
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{activeKey.category}</span>
                </div>
                <p className="mt-2 font-display text-2xl font-bold">{activeKey.name}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-fg/75">{activeKey.desc}</p>
                {mode?.animate && falling && (
                  <div className="mt-4 flex items-center gap-3 font-mono text-[11px] text-muted">
                    <span className="shrink-0">{kb.rebuilding} 5s</span>
                    <span className="h-px flex-1 bg-line">
                      <span
                        key={activeState!.t}
                        className="block h-px origin-left bg-accent animate-[shrink_5s_linear_forwards]"
                      />
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="font-display text-xl font-bold">{mode?.touch ? kb.hintTitleTouch : kb.hint} ↗</p>
                <p className="mt-2 text-sm leading-relaxed text-fg/70">{mode?.touch ? kb.hintTouch : kb.hintSub}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <a href="#projetos" className="rounded-full bg-fg px-5 py-2.5 text-sm font-semibold text-bg transition hover:bg-accent">
              {hero.ctaProjects}
            </a>
            <a href="#contato" className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold transition hover:border-fg">
              {hero.ctaContact}
            </a>
          </div>
        </div>
      </div>

      {/* botões acessíveis sobre cada tecla */}
      {rects.map((r) => {
        const k = keys.find((x) => x.id === r.id)!;
        const st = states[r.id]?.s ?? "idle";
        return (
          <button
            key={r.id}
            type="button"
            aria-label={`${kb.keyAria} ${k.name}`}
            aria-pressed={active === r.id}
            onClick={(e) => press(r.id, e)}
            onPointerEnter={() => engineRef.current?.setHover(r.id)}
            onPointerLeave={() => engineRef.current?.setHover(null)}
            onFocus={() => engineRef.current?.setHover(r.id)}
            onBlur={() => engineRef.current?.setHover(null)}
            className={`absolute z-20 rounded-[14%] outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black ${st === "idle" ? "cursor-pointer" : "cursor-default"}`}
            style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
          />
        );
      })}

      {/* chão da seção, onde a areia se acumula */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-line" />
    </section>
  );
}
