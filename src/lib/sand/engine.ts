/**
 * Motor de areia do teclado de skills.
 *
 * Híbrido de autômato celular + partículas:
 *  - Cada tecla é rasterizada numa grade de células; cada célula opaca vira um grão com "casa" fixa.
 *  - Ao clicar, os grãos entram na grade e seguem regras de areia (gravidade, deslize diagonal,
 *    velocidade balística para o estouro e para o empurrão do mouse).
 *  - Enquanto a tecla está desmanchada, a trajetória dos grãos é gravada (só quadros com movimento).
 *  - Após HOLD_MS, a gravação é tocada ao contrário (rebobinar) e a tecla volta a ser sólida.
 */
import { drawCase, drawKeycap, drawSwitch, paletteFor, type Palette } from "./draw";

export type KeyInput = { id: string; logoPath: string | null; hex: string | null; wide?: boolean };
export type KeyState = "idle" | "fallen" | "rewinding";
export type KeyRect = { id: string; x: number; y: number; w: number; h: number };
export type EngineOptions = { cell: number; cols: number; animate: boolean; push: boolean; accent: string };

const HOLD_MS = 5000;
const REC_EVERY = 3; // grava 1 a cada 3 passos (~20 fps)
const MAX_FRAMES = 110;
const G = 0.22;
const MAXV = 7;
const AIR = 0.93;
const STEP_MS = 1000 / 60;

const EMPTY = -1;
const SOLID = -2;

type Key = KeyInput & {
  pal: Palette;
  path: Path2D | null;
  x: number; y: number; w: number; h: number; // em células
  start: number; count: number;
  state: KeyState;
  at: number;
  rec: Int16Array | null;
  recN: number;
  dirty: boolean; // houve movimento desde a última gravação
  rwDur: number;
};

export class SandEngine {
  private keys: Key[];
  private byId = new Map<string, Key>();
  private opts: EngineOptions;

  private W = 0;
  private H = 0;
  private hostW = 0;
  private hostH = 0;
  private grid = new Int32Array(0);
  private rowCount = new Int32Array(0);

  // grãos (structure of arrays)
  private N = 0;
  private PX = new Float32Array(0);
  private PY = new Float32Array(0);
  private VX = new Float32Array(0);
  private VY = new Float32Array(0);
  private HX = new Int16Array(0);
  private HY = new Int16Array(0);
  private COL = new Uint32Array(0);
  private OWNER = new Uint16Array(0);
  private IN = new Uint8Array(0);
  private STAMP = new Uint32Array(0);

  private sandCtx: CanvasRenderingContext2D;
  private staticCtx: CanvasRenderingContext2D;
  private img: ImageData | null = null;
  private buf = new Uint32Array(0);

  private raf = 0;
  private running = false;
  private visible = true;
  private last = 0;
  private acc = 0;
  private frameNo = 0;
  private settle = 0; // quadros extras após restaurar uma tecla
  private hover: string | null = null;
  private timers: number[] = [];
  private kb = { x: 0, y: 0, w: 0, h: 0, lip: 0, pad: 0 };

  private push = { x: 0, y: 0, vx: 0, vy: 0, ttl: 0, has: false };

  constructor(
    private host: HTMLElement,
    private slot: HTMLElement,
    private staticCanvas: HTMLCanvasElement,
    private sandCanvas: HTMLCanvasElement,
    keys: KeyInput[],
    opts: EngineOptions,
    private onState: (id: string, state: KeyState) => void,
  ) {
    this.opts = opts;
    this.sandCtx = sandCanvas.getContext("2d")!;
    this.staticCtx = staticCanvas.getContext("2d")!;
    this.keys = keys.map((k) => {
      const key: Key = {
        ...k,
        pal: paletteFor(k.hex),
        path: k.logoPath ? new Path2D(k.logoPath) : null,
        x: 0, y: 0, w: 0, h: 0, start: 0, count: 0,
        state: "idle", at: 0, rec: null, recN: 0, dirty: false, rwDur: 1000,
      };
      this.byId.set(k.id, key);
      return key;
    });
  }

  /* ------------------------------------------------------------------ layout */

  /** Recalcula tudo a partir do tamanho atual. Reseta a simulação. Retorna retângulos das teclas (px CSS). */
  layout(opts?: Partial<EngineOptions>): KeyRect[] {
    if (opts) this.opts = { ...this.opts, ...opts };
    this.clearTimers();
    const { cell, cols } = this.opts;

    // 1) posições das teclas em unidades (u)
    const units: { c: number; r: number; span: number }[] = [];
    let c = 0, r = 0;
    for (const k of this.keys) {
      let span = 1;
      if (k.wide) {
        span = cols - c;
        if (span < 2) { r++; c = 0; span = cols; }
      } else if (c >= cols) { r++; c = 0; }
      units.push({ c, r, span });
      c += span;
    }
    const rows = r + 1;

    // 2) tamanho da unidade em células, a partir da largura do slot
    const slotW = this.slot.getBoundingClientRect().width;
    const u = Math.max(8, Math.floor(slotW / cell / (cols + 0.7)));
    const pad = Math.round(u * 0.35);
    const lip = Math.max(2, Math.round(u * 0.09));
    const gap = Math.max(1, Math.round(u * 0.05));
    const kbW = cols * u + pad * 2;
    const kbH = rows * u + pad * 2;
    this.slot.style.height = `${(kbH + lip) * cell}px`;

    // 3) mede depois de fixar a altura do slot
    const hr = this.host.getBoundingClientRect();
    const sr = this.slot.getBoundingClientRect();
    this.hostW = hr.width;
    this.hostH = hr.height;
    this.W = Math.ceil(hr.width / cell);
    this.H = Math.ceil(hr.height / cell);
    const ox = Math.floor((sr.left - hr.left) / cell) + Math.floor((sr.width / cell - kbW) / 2);
    const oy = Math.round((sr.top - hr.top) / cell);
    this.kb = { x: ox, y: oy, w: kbW, h: kbH, lip, pad };

    units.forEach((p, i) => {
      const k = this.keys[i];
      if (k.state !== "idle") this.onState(k.id, "idle");
      k.x = ox + pad + p.c * u + gap;
      k.y = oy + pad + p.r * u + gap;
      k.w = p.span * u - gap * 2;
      k.h = u - gap * 2;
      k.state = "idle";
      k.rec = null;
      k.recN = 0;
    });

    // 4) canvases
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.staticCanvas.width = Math.round(this.hostW * dpr);
    this.staticCanvas.height = Math.round(this.hostH * dpr);
    this.staticCanvas.style.width = `${this.hostW}px`;
    this.staticCanvas.style.height = `${this.hostH}px`;
    this.staticCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.sandCanvas.width = this.W;
    this.sandCanvas.height = this.H;
    this.sandCanvas.style.width = `${this.W * cell}px`;
    this.sandCanvas.style.height = `${this.H * cell}px`;

    if (this.opts.animate) this.buildGrains();
    this.drawStatic();
    this.render();

    return this.keys.map((k) => ({ id: k.id, x: k.x * cell, y: k.y * cell, w: k.w * cell, h: k.h * cell }));
  }

  /** Rasteriza cada tecla na resolução da grade e cria um grão por célula opaca. */
  private buildGrains() {
    const { cell } = this.opts;
    const W = this.W, H = this.H;
    this.grid = new Int32Array(W * H).fill(EMPTY);
    this.rowCount = new Int32Array(H);

    const samples: { k: Key; data: Uint8ClampedArray }[] = [];
    let total = 0;
    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { willReadFrequently: true })!;
    for (const k of this.keys) {
      off.width = k.w;
      off.height = k.h;
      octx.setTransform(1 / cell, 0, 0, 1 / cell, 0, 0);
      octx.clearRect(0, 0, k.w * cell, k.h * cell);
      drawKeycap(octx, 0, 0, k.w * cell, k.h * cell, k.pal, k.path, false);
      const data = octx.getImageData(0, 0, k.w, k.h).data;
      let n = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] > 110) n++;
      k.start = total;
      k.count = n;
      total += n;
      samples.push({ k, data });
    }

    this.N = total;
    this.PX = new Float32Array(total);
    this.PY = new Float32Array(total);
    this.VX = new Float32Array(total);
    this.VY = new Float32Array(total);
    this.HX = new Int16Array(total);
    this.HY = new Int16Array(total);
    this.COL = new Uint32Array(total);
    this.OWNER = new Uint16Array(total);
    this.IN = new Uint8Array(total);
    this.STAMP = new Uint32Array(total);

    samples.forEach(({ k, data }, ki) => {
      let g = k.start;
      for (let yy = 0; yy < k.h; yy++) {
        for (let xx = 0; xx < k.w; xx++) {
          const p = (yy * k.w + xx) * 4;
          if (data[p + 3] <= 110) continue;
          // leve variação de brilho para textura de areia
          const j = 0.88 + Math.random() * 0.24;
          const R = Math.min(255, data[p] * j), Gc = Math.min(255, data[p + 1] * j), B = Math.min(255, data[p + 2] * j);
          this.COL[g] = (255 << 24) | (B << 16) | (Gc << 8) | R;
          this.HX[g] = k.x + xx;
          this.HY[g] = k.y + yy;
          this.OWNER[g] = ki;
          g++;
        }
      }
      // tecla intacta = sólido na grade
      for (let yy = k.y; yy < k.y + k.h; yy++) {
        if (yy < 0 || yy >= H) continue;
        for (let xx = k.x; xx < k.x + k.w; xx++) if (xx >= 0 && xx < W) this.grid[yy * W + xx] = SOLID;
      }
    });

    this.img = this.sandCtx.createImageData(W, H);
    this.buf = new Uint32Array(this.img.data.buffer);
  }

  /* ------------------------------------------------------------------ API */

  setHover(id: string | null) {
    if (this.hover === id) return;
    this.hover = id;
    this.drawStatic();
  }

  getState(id: string): KeyState {
    return this.byId.get(id)?.state ?? "idle";
  }

  /** Desmancha uma tecla. (cx, cy) = ponto do clique em px CSS relativos ao host. */
  explode(id: string, cx?: number, cy?: number) {
    const k = this.byId.get(id);
    if (!k || k.state !== "idle" || !this.opts.animate) return;
    const { cell } = this.opts;
    const W = this.W;
    const ox = cx != null ? cx / cell : k.x + k.w / 2;
    const oy = cy != null ? cy / cell : k.y + k.h / 2;

    for (let yy = k.y; yy < k.y + k.h; yy++)
      for (let xx = k.x; xx < k.x + k.w; xx++) if (this.grid[yy * W + xx] === SOLID) this.grid[yy * W + xx] = EMPTY;

    for (let i = k.start; i < k.start + k.count; i++) {
      const hx = this.HX[i], hy = this.HY[i];
      const idx = hy * W + hx;
      if (this.grid[idx] !== EMPTY) continue; // não deve acontecer
      this.grid[idx] = i;
      this.rowCount[hy]++;
      this.IN[i] = 1;
      this.PX[i] = hx + 0.5;
      this.PY[i] = hy + 0.5;
      this.STAMP[i] = 0;
    }
    k.rec = k.rec ?? new Int16Array(MAX_FRAMES * k.count * 2);
    k.recN = 0;
    this.record(k); // quadro 0 = casa

    // estouro: grãos se afastam do ponto do clique, com leve impulso para cima
    for (let i = k.start; i < k.start + k.count; i++) {
      const dx = this.HX[i] - ox, dy = this.HY[i] - oy;
      const d = Math.hypot(dx, dy) + 1;
      const s = 0.5 + Math.random() * 1.5;
      this.VX[i] = (dx / d) * s + (Math.random() - 0.5) * 0.8;
      this.VY[i] = (dy / d) * s * 0.7 - Math.random() * 1.6;
    }

    k.state = "fallen";
    k.at = performance.now();
    this.onState(k.id, "fallen");
    this.drawStatic();
    this.wake();
  }

  /** Barra de espaço: desmancha tudo em cascata. */
  explodeAll() {
    this.keys.forEach((k, i) => {
      this.timers.push(window.setTimeout(() => this.explode(k.id), i * 45));
    });
  }

  /** Movimento do ponteiro (px CSS relativos ao host). */
  pointer(x: number, y: number) {
    if (!this.opts.push || !this.opts.animate) return;
    const { cell } = this.opts;
    const nx = x / cell, ny = y / cell;
    const p = this.push;
    if (p.has) {
      p.vx = Math.max(-6, Math.min(6, (nx - p.x) * 0.6));
      p.vy = Math.max(-6, Math.min(6, (ny - p.y) * 0.6));
    }
    p.x = nx;
    p.y = ny;
    p.has = true;
    p.ttl = 4;
    this.wake();
  }

  pointerLeave() {
    this.push.has = false;
    this.push.ttl = 0;
  }

  setVisible(v: boolean) {
    this.visible = v;
    if (v) this.wake();
    else this.stop();
  }

  destroy() {
    this.stop();
    this.clearTimers();
  }

  /* ------------------------------------------------------------------ loop */

  private wake() {
    if (this.running || !this.visible || !this.opts.animate) return;
    this.running = true;
    this.last = performance.now();
    this.acc = STEP_MS; // dá um passo imediato
    this.raf = requestAnimationFrame(this.tick);
  }

  private stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private clearTimers() {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
  }

  private tick = (t: number) => {
    if (!this.running) return;
    this.acc += Math.min(t - this.last, 64);
    this.last = t;

    let moved = 0;
    let stepped = false;
    let n = 0;
    while (this.acc >= STEP_MS && n < 3) {
      moved += this.step();
      this.acc -= STEP_MS;
      stepped = true;
      n++;
    }

    let busy = false;
    let staticDirty = false;
    for (const k of this.keys) {
      if (k.state === "fallen") {
        busy = true;
        if (t - k.at >= HOLD_MS) this.startRewind(k, t);
      } else if (k.state === "rewinding") {
        busy = true;
        if (t - k.at >= k.rwDur) {
          this.restore(k);
          staticDirty = true;
        }
      }
    }
    if (staticDirty) this.drawStatic();
    if (stepped || busy) this.render(t);

    if (moved === 0 && !busy && this.push.ttl <= 0 && this.settle-- <= 0) {
      this.render(t);
      this.running = false;
      this.raf = 0;
      return;
    }
    this.raf = requestAnimationFrame(this.tick);
  };

  /** Um passo de simulação. Retorna quantos grãos se moveram. */
  private step(): number {
    const f = ++this.frameNo;
    const W = this.W, H = this.H, grid = this.grid, rc = this.rowCount;
    const PX = this.PX, PY = this.PY, VX = this.VX, VY = this.VY, ST = this.STAMP, OWN = this.OWNER;
    let moved = 0;

    if (this.push.ttl > 0 && this.push.has) {
      this.applyPush();
      this.push.ttl--;
    }

    const ltr = (f & 1) === 0;
    for (let y = H - 1; y >= 0; y--) {
      if (rc[y] === 0) continue;
      const row = y * W;
      for (let xi = 0; xi < W; xi++) {
        const x = ltr ? xi : W - 1 - xi;
        const idx = row + x;
        const i = grid[idx];
        if (i < 0 || ST[i] === f) continue;
        ST[i] = f;

        let vx = VX[i] * AIR;
        let vy = VY[i] + G;
        if (vy > MAXV) vy = MAXV;
        if (vx < 0.05 && vx > -0.05) vx = 0;

        // caminho rápido: em repouso sobre algo -> tenta deslizar na diagonal
        if (vx === 0 && vy > 0) {
          const below = y + 1 < H ? grid[idx + W] : SOLID;
          if (below !== EMPTY) {
            const s = Math.random() < 0.5 ? -1 : 1;
            let did = false;
            for (let t = 0; t < 2 && !did; t++) {
              const dx = t === 0 ? s : -s;
              const nx = x + dx;
              if (nx < 0 || nx >= W || y + 1 >= H) continue;
              if (grid[idx + W + dx] === EMPTY && grid[idx + dx] === EMPTY) {
                const to = idx + W + dx;
                grid[idx] = EMPTY;
                grid[to] = i;
                rc[y]--;
                rc[y + 1]++;
                PX[i] = nx + 0.5;
                PY[i] = y + 1.5;
                VY[i] = 0.6;
                VX[i] = 0;
                this.keys[OWN[i]].dirty = true;
                moved++;
                did = true;
              }
            }
            if (!did) {
              VX[i] = 0;
              VY[i] = 0;
            }
            continue;
          }
        }

        // movimento balístico com checagem célula a célula
        const sx = PX[i], sy = PY[i];
        const steps = Math.ceil(Math.max(vx < 0 ? -vx : vx, vy < 0 ? -vy : vy)) || 1;
        let cx = x, cy = y, blocked = false, hitX = false, hitY = false;
        for (let s = 1; s <= steps; s++) {
          const nx = Math.floor(sx + (vx * s) / steps);
          const ny = Math.floor(sy + (vy * s) / steps);
          if (nx === cx && ny === cy) continue;
          if (nx < 0 || nx >= W || ny < 0 || ny >= H || grid[ny * W + nx] !== EMPTY) {
            blocked = true;
            // qual eixo bloqueou?
            hitY = ny !== cy && (ny < 0 || ny >= H || grid[ny * W + cx] !== EMPTY);
            hitX = nx !== cx && (nx < 0 || nx >= W || grid[cy * W + nx] !== EMPTY);
            if (!hitX && !hitY) hitY = true;
            break;
          }
          cx = nx;
          cy = ny;
        }

        if (cx !== x || cy !== y) {
          const to = cy * W + cx;
          grid[idx] = EMPTY;
          grid[to] = i;
          rc[y]--;
          rc[cy]++;
          this.keys[OWN[i]].dirty = true;
          moved++;
        }
        if (blocked) {
          if (hitY) {
            if (vy > 2.5) vx = vx * 0.6 + (Math.random() - 0.5) * 0.9; // espalha ao cair
            vy = 0;
          }
          if (hitX) vx = -vx * 0.25;
          PX[i] = cx + 0.5;
          PY[i] = cy + 0.5;
        } else {
          PX[i] = sx + vx;
          PY[i] = sy + vy;
        }
        VX[i] = vx;
        VY[i] = vy;
      }
    }

    if (f % REC_EVERY === 0) {
      for (const k of this.keys) if (k.state === "fallen" && k.dirty) this.record(k);
    }
    return moved;
  }

  private applyPush() {
    const p = this.push;
    const R = this.opts.cell <= 2 ? 10 : 7;
    const W = this.W, H = this.H, grid = this.grid;
    const x0 = Math.max(0, Math.floor(p.x - R)), x1 = Math.min(W - 1, Math.ceil(p.x + R));
    const y0 = Math.max(0, Math.floor(p.y - R)), y1 = Math.min(H - 1, Math.ceil(p.y + R));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const i = grid[y * W + x];
        if (i < 0) continue;
        const dx = x + 0.5 - p.x, dy = y + 0.5 - p.y;
        const d = Math.hypot(dx, dy);
        if (d > R) continue;
        const f = 1 - d / R;
        const inv = 1 / (d + 0.5);
        this.VX[i] += (p.vx * 0.5 + dx * inv * 1.1) * f;
        this.VY[i] += (p.vy * 0.5 + dy * inv * 1.1) * f - 0.7 * f;
        if (this.VX[i] > MAXV) this.VX[i] = MAXV;
        else if (this.VX[i] < -MAXV) this.VX[i] = -MAXV;
        if (this.VY[i] < -MAXV) this.VY[i] = -MAXV;
      }
    }
    p.vx *= 0.5;
    p.vy *= 0.5;
  }

  /* ------------------------------------------------------------------ gravação e rebobinar */

  private record(k: Key) {
    if (!k.rec) return;
    const frame = Math.min(k.recN, MAX_FRAMES - 1);
    const base = frame * k.count * 2;
    const prev = (frame - 1) * k.count * 2;
    for (let j = 0; j < k.count; j++) {
      const i = k.start + j;
      if (this.IN[i]) {
        k.rec[base + j * 2] = this.PX[i] | 0;
        k.rec[base + j * 2 + 1] = this.PY[i] | 0;
      } else if (frame > 0) {
        k.rec[base + j * 2] = k.rec[prev + j * 2];
        k.rec[base + j * 2 + 1] = k.rec[prev + j * 2 + 1];
      } else {
        k.rec[base + j * 2] = this.HX[i];
        k.rec[base + j * 2 + 1] = this.HY[i];
      }
    }
    k.recN = frame + 1;
    k.dirty = false;
  }

  private startRewind(k: Key, now: number) {
    this.record(k); // posição final exata
    const W = this.W;
    for (let i = k.start; i < k.start + k.count; i++) {
      if (!this.IN[i]) continue;
      const idx = (this.PY[i] | 0) * W + (this.PX[i] | 0);
      if (this.grid[idx] === i) {
        this.grid[idx] = EMPTY;
        this.rowCount[this.PY[i] | 0]--;
      }
      this.IN[i] = 0;
    }
    k.state = "rewinding";
    k.at = now;
    k.rwDur = Math.max(750, Math.min(1700, k.recN * 26));
    this.onState(k.id, "rewinding");
  }

  /** Tecla volta a ser sólida; grãos alheios no espaço dela são empurrados para cima. */
  private restore(k: Key) {
    const W = this.W, grid = this.grid;
    for (let y = k.y; y < k.y + k.h; y++) {
      for (let x = k.x; x < k.x + k.w; x++) {
        const idx = y * W + x;
        const g = grid[idx];
        if (g >= 0) {
          grid[idx] = EMPTY;
          this.rowCount[y]--;
          let placed = false;
          for (let yy = k.y - 1; yy >= 0; yy--) {
            const v = grid[yy * W + x];
            if (v === SOLID) break;
            if (v === EMPTY) {
              grid[yy * W + x] = g;
              this.rowCount[yy]++;
              this.PX[g] = x + 0.5;
              this.PY[g] = yy + 0.5;
              this.VX[g] = 0;
              this.VY[g] = 0;
              placed = true;
              break;
            }
          }
          if (!placed) this.IN[g] = 0;
        }
        grid[idx] = SOLID;
      }
    }
    k.state = "idle";
    k.recN = 0;
    this.settle = 40;
    this.onState(k.id, "idle");
  }

  /* ------------------------------------------------------------------ render */

  private render(now = performance.now()) {
    if (!this.img) {
      this.sandCtx.clearRect(0, 0, this.W, this.H);
      return;
    }
    const buf = this.buf, W = this.W, H = this.H;
    buf.fill(0);
    const N = this.N, IN = this.IN, PX = this.PX, PY = this.PY, COL = this.COL;
    for (let i = 0; i < N; i++) if (IN[i]) buf[(PY[i] | 0) * W + (PX[i] | 0)] = COL[i];

    // grãos rebobinando: interpolação entre quadros gravados, do último para o primeiro
    for (const k of this.keys) {
      if (k.state !== "rewinding" || !k.rec || k.recN === 0) continue;
      const p = Math.min(1, (now - k.at) / k.rwDur);
      const e = p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2;
      const pos = (k.recN - 1) * (1 - e);
      const f0 = Math.floor(pos), f1 = Math.min(f0 + 1, k.recN - 1), t = pos - f0;
      const b0 = f0 * k.count * 2, b1 = f1 * k.count * 2;
      const rec = k.rec;
      for (let j = 0; j < k.count; j++) {
        const x = Math.round(rec[b0 + j * 2] + (rec[b1 + j * 2] - rec[b0 + j * 2]) * t);
        const y = Math.round(rec[b0 + j * 2 + 1] + (rec[b1 + j * 2 + 1] - rec[b0 + j * 2 + 1]) * t);
        if (x >= 0 && x < W && y >= 0 && y < H) buf[y * W + x] = COL[k.start + j];
      }
    }
    this.sandCtx.putImageData(this.img, 0, 0);
  }

  private drawStatic() {
    const ctx = this.staticCtx;
    const { cell, accent } = this.opts;
    ctx.clearRect(0, 0, this.hostW, this.hostH);
    const kb = this.kb;
    drawCase(ctx, kb.x * cell, kb.y * cell, kb.w * cell, kb.h * cell, kb.lip * cell, kb.pad * cell, accent);
    for (const k of this.keys) {
      const x = k.x * cell, y = k.y * cell, w = k.w * cell, h = k.h * cell;
      if (k.state === "idle") drawKeycap(ctx, x, y, w, h, k.pal, k.path, this.hover === k.id);
      else drawSwitch(ctx, x, y, w, h, k.pal, !!k.wide);
    }
  }
}
