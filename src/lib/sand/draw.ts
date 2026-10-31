/** Desenho do teclado (case, keycaps e switches) em Canvas 2D, em unidades de px CSS. */

type RGB = [number, number, number];

const hexToRgb = (hex: string): RGB => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];
const css = (c: RGB) => `rgb(${c[0]},${c[1]},${c[2]})`;
const luminance = ([r, g, b]: RGB) => {
  const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

export type Palette = {
  skirtTop: string;
  skirtBottom: string;
  top: string;
  topLight: string;
  logo: string;
  stem: string;
};

const BLACK: RGB = [0, 0, 0];
const WHITE: RGB = [255, 255, 255];

/** Keycap tingida com a cor da marca; marcas quase pretas (Next.js, GitHub) viram grafite com logo branco. */
export function paletteFor(hex: string | null): Palette {
  const rgb = hex ? hexToRgb(hex) : null;
  const neutral = !rgb || luminance(rgb) < 0.05;
  const base: RGB = neutral ? [40, 41, 46] : mix(rgb!, [10, 10, 12], 0.6);
  const top: RGB = neutral ? [52, 53, 59] : mix(rgb!, [18, 18, 22], 0.48);
  const logo: RGB = neutral ? [238, 238, 240] : mix(rgb!, WHITE, 0.12);
  return {
    skirtTop: css(mix(base, BLACK, 0.12)),
    skirtBottom: css(mix(base, BLACK, 0.5)),
    top: css(top),
    topLight: css(mix(top, WHITE, 0.1)),
    logo: css(logo),
    stem: css(neutral ? [200, 200, 205] : rgb!),
  };
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function drawKeycap(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  pal: Palette, logo: Path2D | null, hover: boolean,
) {
  const m = Math.min(w, h);
  const r = m * 0.14;

  // saia (laterais da tecla — mais visível embaixo, como vista levemente de cima)
  const sg = ctx.createLinearGradient(0, y, 0, y + h);
  sg.addColorStop(0, pal.skirtTop);
  sg.addColorStop(1, pal.skirtBottom);
  ctx.fillStyle = sg;
  rr(ctx, x, y, w, h, r);
  ctx.fill();

  // face superior
  const il = m * 0.1, it = h * 0.05, ib = h * 0.17;
  const tx = x + il, ty = y + it, tw = w - il * 2, th = h - it - ib;
  const tg = ctx.createLinearGradient(0, ty, 0, ty + th);
  tg.addColorStop(0, pal.topLight);
  tg.addColorStop(1, pal.top);
  ctx.fillStyle = tg;
  rr(ctx, tx, ty, tw, th, r * 0.75);
  ctx.fill();
  if (hover) {
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 1;
  ctx.stroke();

  if (logo) {
    const size = Math.min(tw, th) * 0.52;
    ctx.save();
    ctx.translate(tx + (tw - size) / 2, ty + (th - size) / 2);
    ctx.scale(size / 24, size / 24);
    ctx.fillStyle = pal.logo;
    ctx.fill(logo);
    ctx.restore();
  }
}

/** Switch mecânico exposto quando a tecla vira areia. */
export function drawSwitch(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, pal: Palette, wide: boolean) {
  const cx = x + w / 2, cy = y + h / 2 - h * 0.04;
  const s = Math.min(w, h) * 0.6;
  const housing = (hx: number, size: number) => {
    ctx.fillStyle = "#17181b";
    rr(ctx, hx - size / 2, cy - size / 2, size, size, size * 0.12);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#222327";
    rr(ctx, hx - size * 0.32, cy - size * 0.32, size * 0.64, size * 0.64, size * 0.08);
    ctx.fill();
  };
  housing(cx, s);
  // haste em cruz (cor da marca)
  const a = s * 0.3, b = s * 0.09;
  ctx.fillStyle = pal.stem;
  ctx.fillRect(cx - a / 2, cy - b / 2, a, b);
  ctx.fillRect(cx - b / 2, cy - a / 2, b, a);
  if (wide) {
    // estabilizadores da barra de espaço
    for (const sx of [x + w * 0.12, x + w * 0.88]) {
      ctx.fillStyle = "#141518";
      rr(ctx, sx - s * 0.2, cy - s * 0.3, s * 0.4, s * 0.6, s * 0.06);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.moveTo(x + w * 0.12, cy + s * 0.36);
    ctx.lineTo(x + w * 0.88, cy + s * 0.36);
    ctx.stroke();
  }
}

export function drawCase(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, lip: number, pad: number, accent: string) {
  const r = pad * 0.9;
  // borda frontal (espessura do gabinete)
  ctx.fillStyle = "#0b0b0d";
  rr(ctx, x, y + lip, w, h, r);
  ctx.fill();
  // corpo
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "#1d1e22");
  g.addColorStop(1, "#141518");
  ctx.fillStyle = g;
  rr(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.stroke();
  // placa interna
  const ip = pad * 0.55;
  ctx.fillStyle = "#09090b";
  rr(ctx, x + ip, y + ip, w - ip * 2, h - ip * 2, r * 0.5);
  ctx.fill();
  // detalhes: gravação e LEDs de status
  const fs = Math.max(8, Math.round(pad * 0.38));
  ctx.font = `600 ${fs}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.textBaseline = "middle";
  ctx.fillText("LG—40 · SAND EDITION", x + pad * 0.7, y + ip / 2 + 0.5);
  const dot = Math.max(2, pad * 0.1);
  ["#2a2b30", "#2a2b30", accent].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x + w - pad * 0.8 - i * dot * 4, y + ip / 2, dot, 0, Math.PI * 2);
    ctx.fill();
  });
}
