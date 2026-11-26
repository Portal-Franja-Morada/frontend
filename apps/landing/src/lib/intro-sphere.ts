// Intro de la home: una esfera de partículas forma el logo de Franja y se
// dispersa hacia la página. Adaptado de "Thinking Sphere" (DesignBookmark):
// https://designbookmark.com/motion#db-thinking-sphere
// Prototipo local: WebGL2 sin dependencias.

// Bordó Franja (#79082E), mismo valor que --color-franja-morada.
const BORDO: readonly [number, number, number] = [
  0x79 / 255,
  0x08 / 255,
  0x2e / 255,
];
const LOGO_RATIO = 64 / 440; // /logo.png es 440x64

// Línea de tiempo en segundos, desde que arranca la animación (unos 6 s).
const T_FORM = 1.5; // la esfera empieza a formar el logo
const T_LOGO = 3.85; // aparece el PNG real encima
const T_DISPERSE = 4.7; // las partículas se dispersan y el overlay hace fade
const T_END = 6; // se saca el overlay del DOM
const HARD_CAP_MS = 7000;
const SKIP_FADE_MS = 250;
// Si el módulo llega tarde (red lenta), no tiene sentido arrancar la intro.
const LATE_START_MS = 2500;

const STRIDE = 8; // x, y, tamaño, alfa, suavidad, r, g, b

const VERT = `#version 300 es
in vec4 a; in float b; in vec3 c;
uniform vec2 uRes;
out float vA; out float vS; out vec3 vC;
void main(){
  vec2 p = a.xy / uRes * 2. - 1.;
  gl_Position = vec4(p.x, -p.y, 0., 1.);
  gl_PointSize = a.z;
  vA = a.w; vS = max(b, 1.8 / a.z); vC = c;
}`;

const FRAG = `#version 300 es
precision highp float;
in float vA; in float vS; in vec3 vC;
out vec4 o;
void main(){
  float r = length(gl_PointCoord - .5) * 2.;
  float e = (1. - smoothstep(1. - vS, 1., r)) * vA;
  o = vec4(vC * e, e);
}`;

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Resorte mínimo del demo: x persigue a t con rigidez k y amortiguación c.
type Spring = { x: number; v: number; t: number; k: number; c: number };
const spring = (k: number, c: number): Spring => ({ x: 0, v: 0, t: 0, k, c });
const stepSpring = (s: Spring, dt: number) => {
  s.v += (-s.k * (s.x - s.t) - s.c * s.v) * dt;
  s.x += s.v * dt;
};

type LogoPoints = {
  tx: Float32Array;
  ty: Float32Array;
  tc: Float32Array;
  minx: number;
  maxx: number;
};

// Rasteriza el logo al tamaño en pantalla y toma posición y color de los
// píxeles opacos, con la grilla más densa que entre en n partículas.
function sampleLogo(
  img: HTMLImageElement,
  lw: number,
  lh: number,
  n: number,
): LogoPoints | null {
  const off = document.createElement("canvas");
  off.width = Math.ceil(lw);
  off.height = Math.ceil(lh);
  const ctx = off.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, off.width, off.height);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, off.width, off.height).data;
  } catch {
    return null;
  }

  let list: number[] = [];
  for (let g = 1; g < 8; g += 0.1) {
    list = [];
    for (let y = 0; y < off.height; y += g) {
      for (let x = 0; x < off.width; x += g) {
        const k = ((y | 0) * off.width + (x | 0)) * 4;
        if (data[k + 3] > 140) list.push(x, y, k);
      }
    }
    if (list.length / 3 <= n) break;
  }

  const m = list.length / 3;
  if (!m) return null;

  const idx = Array.from({ length: m }, (_, i) => i);
  for (let i = m - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }

  const tx = new Float32Array(n);
  const ty = new Float32Array(n);
  const tc = new Float32Array(n * 3);
  let minx = Infinity;
  let maxx = -Infinity;
  for (let i = 0; i < n; i++) {
    const p = idx[i % m] * 3;
    const k = list[p + 2];
    tx[i] = list[p];
    ty[i] = list[p + 1];
    tc[i * 3] = data[k] / 255;
    tc[i * 3 + 1] = data[k + 1] / 255;
    tc[i * 3 + 2] = data[k + 2] / 255;
    minx = Math.min(minx, tx[i]);
    maxx = Math.max(maxx, tx[i]);
  }
  return { tx, ty, tc, minx, maxx };
}

function compile(
  gl: WebGL2RenderingContext,
  type: number,
  src: string,
): WebGLShader | null {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export function runIntro(root: HTMLElement): void {
  const canvas = root.querySelector("canvas");
  const logo = root.querySelector("img");

  let closed = false;
  let raf = 0;
  let capTimer = 0;
  let endTimer = 0;
  const listeners = new AbortController();
  let release = () => {};

  function finish() {
    if (closed) return;
    closed = true;
    cancelAnimationFrame(raf);
    window.clearTimeout(capTimer);
    window.clearTimeout(endTimer);
    listeners.abort();
    release();
    root.remove();
  }

  function fadeOut(ms: number) {
    if (closed || root.hasAttribute("data-fading")) return;
    root.style.transitionDuration = `${ms}ms`;
    root.setAttribute("data-fading", "");
    endTimer = window.setTimeout(finish, ms);
  }

  const t0 = Number(root.dataset.t0);
  if (
    !canvas ||
    !logo ||
    (Number.isFinite(t0) && performance.now() - t0 > LATE_START_MS)
  ) {
    finish();
    return;
  }

  capTimer = window.setTimeout(finish, HARD_CAP_MS);

  // Saltar: clic, cualquier tecla, rueda o arrastre táctil. Nada de
  // preventDefault, así la tecla o el gesto siguen llegando a la página.
  const skip = () => fadeOut(SKIP_FADE_MS);
  const opts: AddEventListenerOptions = {
    passive: true,
    signal: listeners.signal,
  };
  window.addEventListener("pointerdown", skip, opts);
  window.addEventListener("keydown", skip, opts);
  window.addEventListener("wheel", skip, opts);
  window.addEventListener("touchmove", skip, opts);
  window.addEventListener("resize", skip, opts);

  // Hover (solo mouse): inclina la esfera hacia el cursor y aparta los puntos
  // cercanos. No toca el reloj de la intro.
  let hoverOn = false;
  let mx = 0;
  let my = 0;
  window.addEventListener(
    "pointermove",
    (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      hoverOn = true;
      mx = e.clientX;
      my = e.clientY;
    },
    opts,
  );
  root.addEventListener(
    "pointerleave",
    () => {
      hoverOn = false;
    },
    opts,
  );

  const gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
  });
  if (!gl) {
    finish();
    return;
  }

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  const vbo = gl.createBuffer();
  const vao = gl.createVertexArray();

  release = () => {
    gl.deleteVertexArray(vao);
    gl.deleteBuffer(vbo);
    gl.deleteProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };

  if (!vs || !fs || !prog || !vbo || !vao) {
    finish();
    return;
  }
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    finish();
    return;
  }

  logo.decode().then(
    () => {
      if (!closed) start(gl, canvas, logo, prog, vbo, vao);
    },
    () => finish(),
  );

  function start(
    gl: WebGL2RenderingContext,
    canvas: HTMLCanvasElement,
    logo: HTMLImageElement,
    prog: WebGLProgram,
    vbo: WebGLBuffer,
    vao: WebGLVertexArrayObject,
  ) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const mobile =
      window.matchMedia("(max-width: 767px)").matches ||
      (navigator.hardwareConcurrency || 8) <= 4;
    const N = mobile ? 800 : 1600;
    const dpr = Math.min(mobile ? 1.5 : 2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);

    const cx = W / 2;
    const cy = H / 2;
    const lw = Math.min(560, W * 0.86);
    const lh = lw * LOGO_RATIO;
    logo.style.width = `${lw}px`;

    const sampled = sampleLogo(logo, lw, lh, N);
    if (!sampled) {
      finish();
      return;
    }
    const pts = sampled;
    // Pasa las posiciones del logo a coordenadas de pantalla (centrado).
    const ox = cx - lw / 2;
    const oy = cy - lh / 2;
    for (let i = 0; i < N; i++) {
      pts.tx[i] += ox;
      pts.ty[i] += oy;
    }
    const minx = pts.minx + ox;
    const span = Math.max(1, pts.maxx - pts.minx);

    const buf = new Float32Array(N * STRIDE);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, buf.byteLength, gl.DYNAMIC_DRAW);
    gl.bindVertexArray(vao);
    const la = gl.getAttribLocation(prog, "a");
    const lb = gl.getAttribLocation(prog, "b");
    const lc = gl.getAttribLocation(prog, "c");
    gl.enableVertexAttribArray(la);
    gl.vertexAttribPointer(la, 4, gl.FLOAT, false, STRIDE * 4, 0);
    gl.enableVertexAttribArray(lb);
    gl.vertexAttribPointer(lb, 1, gl.FLOAT, false, STRIDE * 4, 16);
    gl.enableVertexAttribArray(lc);
    gl.vertexAttribPointer(lc, 3, gl.FLOAT, false, STRIDE * 4, 20);
    gl.bindVertexArray(null);
    const uRes = gl.getUniformLocation(prog, "uRes");

    // Esfera de Fibonacci y datos por partícula.
    const bx = new Float32Array(N);
    const by = new Float32Array(N);
    const bz = new Float32Array(N);
    const s = new Float32Array(N); // progreso esfera -> logo (resorte)
    const v = new Float32Array(N);
    const dl = new Float32Array(N); // cuándo arranca cada una
    const jx = new Float32Array(N);
    const jy = new Float32Array(N);
    const sw = new Float32Array(N);
    const dvx = new Float32Array(N); // desplazamiento al dispersarse
    const dvy = new Float32Array(N);
    const GA = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = GA * i;
      bx[i] = Math.cos(th) * r;
      by[i] = y;
      bz[i] = Math.sin(th) * r;
      jx[i] = (Math.random() - 0.5) * 70;
      jy[i] = 40 + Math.random() * 60;
      sw[i] = 0.7 + Math.random() * 0.6;
      // escalonado de izquierda a derecha, como el demo
      dl[i] = T_FORM + ((pts.tx[i] - minx) / span) * 1.3 + Math.random() * 0.2;
      const ang =
        Math.atan2(pts.ty[i] - cy, pts.tx[i] - cx) +
        (Math.random() - 0.5) * 1.2;
      const dist = 80 + Math.random() * 180;
      dvx[i] = Math.cos(ang) * dist;
      dvy[i] = Math.sin(ang) * dist;
    }

    const R = Math.min(120, W * 0.26, H * 0.26);
    const F = 520;
    const zf = R * 0.75;
    const K = 110; // rigidez del resorte
    const C = 15; // amortiguación
    const pitch = 0.32;
    const hov = spring(200, 26); // intensidad del hover, entra y sale suave
    const hx = spring(120, 16); // inclinación hacia el cursor
    const hy = spring(120, 16);
    let yaw = 0;
    let t = 0;
    let last = performance.now();
    let logoShown = false;

    function frame(now: number) {
      if (closed) return;
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      t += dt;

      if (!logoShown && t >= T_LOGO) {
        logoShown = true;
        logo.setAttribute("data-visible", "");
      }
      if (t >= T_DISPERSE) {
        fadeOut(Math.round((T_END - T_DISPERSE) * 1000));
      }

      yaw += 0.38 * dt;
      hov.t = hoverOn ? 1 : 0;
      hx.t = hoverOn ? clamp((mx - cx) / W, -0.5, 0.5) : 0;
      hy.t = hoverOn ? clamp((my - cy) / H, -0.5, 0.5) : 0;
      stepSpring(hov, dt);
      stepSpring(hx, dt);
      stepSpring(hy, dt);
      const ry = yaw + hx.x * 0.5;
      const rx = pitch + hy.x * 0.4;
      const cyw = Math.cos(ry);
      const syw = Math.sin(ry);
      const cxp = Math.cos(rx);
      const sxp = Math.sin(rx);
      const gb = 0.025 * Math.sin(t * 1.7);
      const dp = clamp((t - T_DISPERSE) / (T_END - T_DISPERSE), 0, 1);
      const de = 1 - (1 - dp) * (1 - dp);

      for (let i = 0; i < N; i++) {
        const px = bx[i];
        const py = by[i];
        const pz = bz[i];
        const nz =
          0.1 *
            Math.sin(px * 2.3 + t * 0.9) *
            Math.sin(py * 2.9 - t * 0.7 + 1.3) *
            Math.sin(pz * 2.1 + t * 1.1 + 0.5) +
          0.018 * Math.sin(px * 5.1 - t * 1.3 + py * 3.7);
        const r = R * (1 + nz + gb);
        const x = (px * cyw - pz * syw) * r;
        let z = (px * syw + pz * cyw) * r;
        let y = py * r;
        const y2 = y * cxp - z * sxp;
        z = y * sxp + z * cxp;
        y = y2;
        const sc = F / (F - z);
        let sx = cx + x * sc;
        let sy = cy + y * sc;
        const front = clamp((z / R + 1) / 2, 0, 1);
        // Empuje del hover, como el demo: se apaga a medida que el punto
        // llega al logo (1 - s), así no impide que la forma se arme.
        if (hov.x > 0.01) {
          const dx = sx - mx;
          const dy = sy - my;
          const d = Math.hypot(dx, dy) + 0.001;
          if (d < 64) {
            const f =
              (1 - d / 64) ** 2 *
              18 *
              hov.x *
              (0.3 + 0.7 * front) *
              (1 - clamp(s[i], 0, 1));
            sx += (dx / d) * f;
            sy += (dy / d) * f;
          }
        }
        const blur = clamp(Math.abs(z - zf) / (R * 1.5), 0, 1);
        let size = (1.35 + 0.7 * front) * sc + blur * blur * 6.5;
        let al =
          ((0.16 + 0.84 * front) * (1 - blur * 0.45)) / (1 + blur * blur * 2.2);
        let soft = blur;

        const tg = t >= dl[i] ? 1 : 0;
        if (s[i] !== tg || v[i] !== 0) {
          const h = dt / 2;
          for (let n = 0; n < 2; n++) {
            v[i] += (-K * (s[i] - tg) - C * v[i]) * h;
            s[i] += v[i] * h;
          }
          if (Math.abs(s[i] - tg) < 1e-4 && Math.abs(v[i]) < 1e-3) {
            s[i] = tg;
            v[i] = 0;
          }
        }

        let X = sx;
        let Y = sy;
        const u = clamp(s[i], 0, 1);
        const tx = pts.tx[i];
        const ty = pts.ty[i];
        if (s[i] > 0) {
          const ax = sx - cx;
          const ay = sy - cy;
          const al2 = Math.hypot(ax, ay) + 0.001;
          // curva: remolino con el giro y bajada sobre el logo
          const p1x = sx - (ay / al2) * 80 * sw[i];
          const p1y = sy + (ax / al2) * 80 * sw[i] - 20;
          const p2x = tx + jx[i];
          const p2y = ty - jy[i];
          const e = 1 - u;
          const b0 = e * e * e;
          const b1 = 3 * e * e * u;
          const b2 = 3 * e * u * u;
          const b3 = u * u * u;
          X = b0 * sx + b1 * p1x + b2 * p2x + b3 * tx;
          Y = b0 * sy + b1 * p1y + b2 * p2y + b3 * ty;
          if (s[i] > 1) {
            const o = (s[i] - 1) * 1.2;
            X += (tx - p2x) * o;
            Y += (ty - p2y) * o;
          }
          const fly = Math.sin(u * Math.PI);
          size = lerp(size, 2.1, u) + fly * 0.6;
          al = lerp(al, 1, u);
          soft = lerp(soft, 0, Math.min(1, u * 1.6));
        }

        if (dp > 0) {
          X += dvx[i] * de;
          Y += dvy[i] * de;
          al *= 1 - dp;
        }

        const q = i * STRIDE;
        buf[q] = X * dpr;
        buf[q + 1] = Y * dpr;
        buf[q + 2] = size * dpr;
        buf[q + 3] = clamp(al, 0, 1);
        buf[q + 4] = soft * 0.85;
        buf[q + 5] = lerp(BORDO[0], pts.tc[i * 3], u);
        buf[q + 6] = lerp(BORDO[1], pts.tc[i * 3 + 1], u);
        buf[q + 7] = lerp(BORDO[2], pts.tc[i * 3 + 2], u);
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(prog);
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, buf);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.POINTS, 0, N);

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
  }
}
