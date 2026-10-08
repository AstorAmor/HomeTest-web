"use client";

import { useEffect, useRef, useState } from "react";
import copy from "@/content/prelaunch.json";

// Gráfica de la portada: la línea de un biomarcador se dibuja de izquierda a derecha a lo largo de
// cuatro análisis, entra en la banda óptima y el último punto se queda latiendo; luego se apaga y
// se dibuja el siguiente marcador. Nombres y cifras en content/prelaunch.json → "grafica".
// Sin JavaScript o con "reducir movimiento" se ve la primera curva entera, quieta.

const W = 400;
const H = 120;
const PAD_X = 10;
const PAD_Y = 12;
// Banda óptima, en fracción de la altura útil (0 abajo, 1 arriba)
const BAND: [number, number] = [0.58, 0.86];
// Valor de cada análisis (inicio, 3, 6 y 12 meses), en el mismo orden que "grafica"
const CURVES = [
  [0.16, 0.38, 0.62, 0.72], // vitamina D: sale del déficit y entra en la banda
  [0.22, 0.3, 0.55, 0.7], // ferritina: lenta al principio, como los depósitos de hierro
  [0.12, 0.34, 0.56, 0.78], // omega-3 index: subida constante
];
const TESTS_X = [0, 0.3, 0.6, 1];

const DRAW_MS = 2400;
const HOLD_MS = 3800;
const FADE_MS = 600;

const sx = (x: number) => PAD_X + x * (W - 2 * PAD_X);
const sy = (v: number) => H - PAD_Y - v * (H - 2 * PAD_Y);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Curva suave que pasa por los análisis sin pasarse de ellos (interpolación cúbica monótona),
// muestreada en puntos para poder seguir la punta de la línea mientras se dibuja.
function sample(ys: number[]): [number, number][] {
  const n = ys.length;
  const d = ys.slice(0, -1).map((y, i) => (ys[i + 1] - y) / (TESTS_X[i + 1] - TESTS_X[i]));
  const m = ys.map((_, i) => (i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  const pts: [number, number][] = [];
  for (let i = 0; i < n - 1; i++) {
    const h = TESTS_X[i + 1] - TESTS_X[i];
    for (let k = 0; k < 40; k++) {
      const s = k / 40;
      const y =
        (2 * s ** 3 - 3 * s ** 2 + 1) * ys[i] +
        (s ** 3 - 2 * s ** 2 + s) * h * m[i] +
        (-2 * s ** 3 + 3 * s ** 2) * ys[i + 1] +
        (s ** 3 - s ** 2) * h * m[i + 1];
      pts.push([TESTS_X[i] + s * h, y]);
    }
  }
  pts.push([1, ys[n - 1]]);
  return pts;
}

function yAt(pts: [number, number][], x: number) {
  const i = Math.min(pts.length - 2, Math.max(0, Math.floor(x * (pts.length - 1))));
  const [x0, y0] = pts[i];
  const [x1, y1] = pts[i + 1];
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
}

export default function TrendLine() {
  const series = copy.grafica.slice(0, CURVES.length);
  const [idx, setIdx] = useState(0);
  const clipRef = useRef<SVGRectElement>(null);
  const tipRef = useRef<SVGCircleElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const dotsRef = useRef<(SVGGElement | null)[]>([]);

  const pts = sample(CURVES[idx]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`).join("");
  const area = `${line}L${sx(1)} ${H - PAD_Y}L${sx(0)} ${H - PAD_Y}Z`;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const clip = clipRef.current;
    const tip = tipRef.current;
    const group = groupRef.current;
    if (!clip || !tip || !group) return;

    let raf = 0;
    const timers: number[] = [];
    const setProgress = (p: number) => {
      const x = sx(p);
      clip.setAttribute("width", String(x));
      tip.setAttribute("cx", String(x));
      tip.setAttribute("cy", String(sy(yAt(pts, p))));
      tip.style.opacity = p > 0 && p < 1 ? "1" : "0";
      dotsRef.current.forEach((dot, i) => dot?.classList.toggle("is-on", p >= TESTS_X[i] - 0.001));
    };

    // Empieza vacía y se dibuja; la primera vez espera a que la portada termine de aparecer.
    // Los puntos se esconden sin transición: si no, los del marcador nuevo asomarían un instante.
    dotsRef.current.forEach((dot) => dot && (dot.style.transition = "none"));
    setProgress(0);
    group.getBoundingClientRect();
    dotsRef.current.forEach((dot) => dot && (dot.style.transition = ""));
    group.style.transition = "none";
    group.style.opacity = "1";
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / DRAW_MS);
      setProgress(easeInOut(t));
      if (t < 1) raf = requestAnimationFrame(tick);
      else
        timers.push(
          window.setTimeout(() => {
            group.style.transition = `opacity ${FADE_MS}ms ease`;
            group.style.opacity = "0";
            timers.push(window.setTimeout(() => setIdx((i) => (i + 1) % series.length), FADE_MS));
          }, HOLD_MS),
        );
    };
    timers.push(window.setTimeout(() => (raf = requestAnimationFrame(tick)), idx === 0 ? 900 : 150));

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
    // pts depende solo de idx
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, series.length]);

  const current = series[idx] ?? series[0];

  return (
    <figure className="trendline mx-auto w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id="trendline-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgb(var(--color-gold))" stopOpacity="0.22" />
            <stop offset="1" stopColor="rgb(var(--color-gold))" stopOpacity="0" />
          </linearGradient>
          <clipPath id="trendline-clip">
            <rect ref={clipRef} x="0" y="0" width={W} height={H} />
          </clipPath>
        </defs>

        {/* Banda óptima */}
        <rect x={sx(0)} y={sy(BAND[1])} width={sx(1) - sx(0)} height={sy(BAND[0]) - sy(BAND[1])} fill="rgb(255 255 255 / 0.05)" />
        <line x1={sx(0)} x2={sx(1)} y1={sy(BAND[1])} y2={sy(BAND[1])} stroke="rgb(255 255 255 / 0.12)" strokeWidth="1" />
        <line x1={sx(0)} x2={sx(1)} y1={sy(BAND[0])} y2={sy(BAND[0])} stroke="rgb(255 255 255 / 0.12)" strokeWidth="1" />
        <text
          x={sx(1) - 4}
          y={sy(BAND[1]) - 6}
          textAnchor="end"
          fill="rgb(var(--color-gold) / 0.75)"
          style={{ fontFamily: "var(--font-logo)", fontSize: 8.5, letterSpacing: "0.22em" }}
        >
          {copy.grafica_rango.toUpperCase()}
        </text>
        <line x1={sx(0)} x2={sx(1)} y1={H - PAD_Y} y2={H - PAD_Y} stroke="rgb(255 255 255 / 0.18)" strokeWidth="1" />

        <g ref={groupRef}>
          <g clipPath="url(#trendline-clip)">
            <path d={area} fill="url(#trendline-fill)" />
            <path d={line} fill="none" stroke="rgb(var(--color-gold))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          {/* Un punto por análisis; aparecen cuando la línea llega a ellos */}
          {CURVES[idx].map((v, i) => (
            <g
              key={i}
              ref={(el) => {
                dotsRef.current[i] = el;
              }}
              className={`trendline-dot is-on${i === CURVES[idx].length - 1 ? " is-last" : ""}`}
            >
              {i === CURVES[idx].length - 1 && <circle className="trendline-pulse" cx={sx(TESTS_X[i])} cy={sy(v)} r="4" fill="rgb(var(--color-gold))" />}
              <circle cx={sx(TESTS_X[i])} cy={sy(v)} r="4" fill="rgb(var(--color-ink))" stroke="rgb(var(--color-gold))" strokeWidth="2" />
            </g>
          ))}
          <circle ref={tipRef} r="3" fill="rgb(var(--color-gold))" style={{ opacity: 0, filter: "drop-shadow(0 0 6px rgb(201 163 107 / 0.9))" }} />
        </g>
      </svg>

      <figcaption key={idx} className="trendline-caption mt-3 flex items-baseline justify-center gap-3 text-xs">
        <span className="font-logo font-medium uppercase tracking-[0.25em] text-gold">{current.marcador}</span>
        <span className="text-on-accent/60">{current.detalle}</span>
      </figcaption>
    </figure>
  );
}
