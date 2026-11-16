"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import Container from "../ui/Container";
import { Contador, REINICIO_MS, escalon, useEnPantalla, useMenosMovimiento } from "./escenas/animacion";
import type { Inicio } from "@/lib/content";
import type { Lang } from "@/lib/i18n";

// «La app, por dentro», después de «Cómo funciona»: lo que se apunta en la app, en tarjetas de cristal
// como las de los pasos (.vidrio), que flotan en 3D a distintas profundidades. Entran desde el fondo,
// se inclinan un poco con el ratón (las de delante más) y, ya fuera, se animan por fases: tu semana (energía,
// check-in con su regla y pausa guiada), la medicación, el menú con fotos, el entreno, el ciclo, el agua, la
// hidratación (color y semana) y la digestión con sus molestias (el orden, en PANTALLAS, al final). Detrás, unos brillos suaves de la paleta de la marca
// que se ven a través del cristal. Cambia sola cada pocos segundos mientras se ve; la lista la cambia al
// momento. Textos en content/inicio.json → "app".
// No son capturas: copian las pantallas de la app (hometest-app: BathroomVisuals.tsx, WaterCard.tsx,
// LogUrineScreen.tsx, CheckInScreen.tsx, MedicationsScreen.tsx, diet/TodayMenuCard.tsx, workouts/…)
// con datos de ejemplo y sin textos inventados.
// Estilo (2026-11-16): el de la app nueva, que es solo oscura. Cristal esmeralda (.vidrio en globals.css), letra
// Inter con las cifras finas, jade para lo que se marca o avanza y oro para lo de pago o lo que hay que revisar.
// Sin emojis ni píldoras de color: la escala del check-in es la regla de la app (components/checkin/Ruler.tsx).
// Descartadas en el borrador (21/10): un prisma de pantallas planas, gotas y un vaso en 3D saliendo de un
// móvil y un móvil del que salían recortes. Astor quiere lo sobrio: nada que rompa la estética de la web.

type Copy = Inicio["app"];
type Textos = Copy["pantallas"];

// Colores de la orina, los mismos de la app (src/types/bathroom.ts); los nombres van en los textos.
// La elegida es la amarilla (el pajizo claro, en pantalla, se ve como un color raro).
const ORINA = ["#F4F1E4", "#F3E7A6", "#EDD35C", "#D9A93A", "#B97A24", "#7B4A22", "#C4626A", "#E3DED0"];
const TURBIA = 7;
const ELEGIDA = 2;
const AGUA = "#74B9E8"; // el azul del agua de la app (GOAL_COLORS.water en TodayScreen.tsx)
const JADE = "#83D6B4";
const ORO = "#D8B978";
const MARFIL = "#F0EFE6";

// Luminosidad (0 negro … 1 blanco): por encima de 0,85 la gota lleva borde
const lum = (hex: string) => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

// Fases de una pantalla (0 = vacía, 1, 2…), como useFases de las escenas de los pasos pero sin repetir:
// se queda en la última mientras está elegida y vuelve a 0 en cuanto deja de estarlo (así sus tarjetas
// se van al fondo). Con «reducir movimiento», directamente la última.
function useFasesPantalla(activa: boolean, duraciones: readonly number[]) {
  const menos = useMenosMovimiento();
  const [fase, setFase] = useState(0);
  const ultima = duraciones.length - 1;
  useEffect(() => {
    if (!activa) return setFase(0);
    if (menos) return setFase(ultima);
    if (fase >= ultima) return;
    const t = setTimeout(() => setFase((f) => f + 1), duraciones[fase]);
    return () => clearTimeout(t);
  }, [activa, menos, fase, ultima, duraciones]);
  return fase;
}

// Una tarjeta de cristal en el espacio: `z` es lo cerca que flota (px) y `giro` cuánto se vuelve hacia
// quien mira. Entra desde el fondo cuando `on` pasa a true y se va hacia el fondo al apagarse. Al entrar la
// cruza un reflejo muy suave; con `reflejo={false}` no lo lleva (en la tarjeta pequeña de la pausa se veía como
// una raya vertical al pasar por encima del círculo).
function Cristal({
  on,
  z,
  giro = 0,
  flota = 0,
  reflejo = true,
  className,
  children,
}: {
  on: boolean;
  z: number;
  giro?: number;
  flota?: number;
  reflejo?: boolean;
  className: string;
  children: ReactNode;
}) {
  return (
    <div className={`la-cristal absolute ${className}`} data-on={on} style={{ "--z": `${z}px`, "--g": `${giro}deg` } as CSSProperties}>
      <div className="la-flota relative" style={{ animationDelay: `${-flota}s` }}>
        <div className={`vidrio la-vidrio p-[1.15em] ${reflejo ? "" : "la-sin-reflejo"}`}>{children}</div>
      </div>
    </div>
  );
}

// La etiqueta pequeña de cada tarjeta, como las cabeceras de la app: mayúsculas, apagada y con su punto de color
const Pastilla = ({ color, children, late }: { color: string; children: ReactNode; late?: boolean }) => (
  <span className="inline-flex items-center gap-[0.5em] text-[0.66em] font-semibold uppercase tracking-[0.1em] text-text-muted">
    <span className={`h-[0.5em] w-[0.5em] rounded-full ${late ? "latido" : ""}`} style={{ background: color }} />
    {children}
  </span>
);

// La gota de la app (viewBox 0 0 54 70: x 5–49, y 3–67, parte redonda de radio 22 en 27,45) y la
// misma agrandada `d` unidades para el anillo de selección (la punta sube más porque es un pico).
const GOTA = "M27 3 C27 3 49 30 49 45 A22 22 0 0 1 5 45 C5 30 27 3 27 3Z";
const anilloGota = (d: number) => {
  const p = 3 - 1.6 * d;
  return `M27 ${p} C27 ${p} ${49 + d} ${30 - 0.35 * d} ${49 + d} 45 A${22 + d} ${22 + d} 0 0 1 ${5 - d} 45 C${5 - d} ${30 - 0.35 * d} 27 ${p} 27 ${p}Z`;
};

function Check({ color, size }: { color: string; size: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// `alto` en em; con `elegida` definido se dibuja el anillo jade al pasar a true
function Gota({ color, alto, turbia, elegida, brillo = true, children }: { color: string; alto: number; turbia?: boolean; elegida?: boolean; brillo?: boolean; children?: ReactNode }) {
  const s = alto / 66;
  return (
    <span className="relative inline-block shrink-0" style={{ width: `${46 * s}em`, height: `${alto}em` }}>
      {elegida !== undefined && (
        <svg viewBox="-3 -8 60 82" aria-hidden className="absolute overflow-visible" style={{ left: `${-7 * s}em`, top: `${-10 * s}em`, width: `${60 * s}em`, height: `${82 * s}em` }}>
          <path d={anilloGota(5.5)} fill="none" stroke={JADE} strokeWidth={3} strokeLinejoin="round" pathLength={1} className="trazo" data-on={elegida} />
        </svg>
      )}
      <svg viewBox="4 2 46 66" aria-hidden className="absolute inset-0 block h-full w-full overflow-visible">
        <path d={GOTA} fill={color} stroke={lum(color) > 0.85 ? "#D9CFBE" : color} strokeWidth={1.5} />
        {turbia && (
          <g>
            <circle cx={30} cy={28} r={2.2} fill="#fff" opacity={0.75} />
            <circle cx={22} cy={37} r={2.6} fill="#B5AA93" opacity={0.45} />
            <circle cx={36} cy={41} r={3} fill="#fff" opacity={0.75} />
            <circle cx={29} cy={50} r={2.4} fill="#B5AA93" opacity={0.45} />
            <circle cx={39} cy={54} r={2} fill="#B5AA93" opacity={0.45} />
          </g>
        )}
        {brillo && <path d="M15 44 A12 12 0 0 0 21 56" fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={3} strokeLinecap="round" />}
      </svg>
      {children != null && (
        <span className="absolute flex items-center justify-center" style={{ left: `${1 * s}em`, top: `${21 * s}em`, width: `${44 * s}em`, height: `${44 * s}em` }}>
          {children}
        </span>
      )}
    </span>
  );
}

// Formas abstractas de la escala de Bristol (las de la app, components/BathroomVisuals.tsx), en oro y en
// una caja de 20
function Bristol({ tipo, size, color = ORO }: { tipo: number; size: string; color?: string }) {
  const s = 20;
  const formas: Record<number, ReactNode> = {
    1: [
      [0.28, 0.42, 0.1],
      [0.52, 0.36, 0.09],
      [0.72, 0.5, 0.1],
      [0.42, 0.62, 0.09],
    ].map(([x, y, r]) => <circle key={x} cx={s * x} cy={s * y} r={s * r} fill={color} />),
    2: [
      [0.26, 0.5, 0.13],
      [0.44, 0.46, 0.14],
      [0.62, 0.5, 0.13],
      [0.78, 0.47, 0.11],
    ].map(([x, y, r]) => <circle key={x} cx={s * x} cy={s * y} r={s * r} fill={color} />),
    3: (
      <>
        <rect x={s * 0.12} y={s * 0.36} width={s * 0.76} height={s * 0.28} rx={s * 0.14} fill={color} />
        <path
          d={`M ${s * 0.34} ${s * 0.38} l ${s * 0.04} ${s * 0.1} M ${s * 0.56} ${s * 0.6} l ${s * 0.04} -${s * 0.1} M ${s * 0.7} ${s * 0.38} l -${s * 0.03} ${s * 0.09}`}
          stroke="#0F2722"
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      </>
    ),
    4: <rect x={s * 0.12} y={s * 0.37} width={s * 0.76} height={s * 0.26} rx={s * 0.13} fill={color} />,
    5: [
      [0.3, 0.46, 0.14, 0.1],
      [0.6, 0.42, 0.15, 0.11],
      [0.48, 0.64, 0.13, 0.09],
    ].map(([x, y, rx, ry]) => <ellipse key={x} cx={s * x} cy={s * y} rx={s * rx} ry={s * ry} fill={color} />),
    6: (
      <path
        d={`M ${s * 0.16} ${s * 0.56} q ${s * 0.06} -${s * 0.2} ${s * 0.18} -${s * 0.08} q ${s * 0.08} -${s * 0.16} ${s * 0.2} -${s * 0.04} q ${s * 0.12} -${s * 0.12} ${s * 0.2} ${s * 0.04} q ${s * 0.12} ${s * 0.06} ${s * 0.02} ${s * 0.18} q -${s * 0.1} ${s * 0.1} -${s * 0.24} ${s * 0.04} q -${s * 0.14} ${s * 0.08} -${s * 0.24} -${s * 0.02} q -${s * 0.1} -${s * 0.02} -${s * 0.12} -${s * 0.12} Z`}
        fill={color}
      />
    ),
    7: (
      <>
        <path d={`M ${s * 0.12} ${s * 0.46} q ${s * 0.1} -${s * 0.08} ${s * 0.19} 0 t ${s * 0.19} 0 t ${s * 0.19} 0 t ${s * 0.19} 0`} stroke={color} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        <path d={`M ${s * 0.12} ${s * 0.6} q ${s * 0.1} -${s * 0.08} ${s * 0.19} 0 t ${s * 0.19} 0 t ${s * 0.19} 0 t ${s * 0.19} 0`} stroke={color} strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.6} />
      </>
    ),
  };
  return (
    <svg viewBox={`0 0 ${s} ${s}`} width={size} height={size} aria-hidden>
      {formas[tipo]}
    </svg>
  );
}

type PropsPantalla = { activa: boolean; t: Textos; idioma: string };

// Tu hidratación, más allá del agua: entra la tarjeta del color, caen las ocho gotas, se elige la
// amarilla y delante llega la semana, con las veces de cada día y la idea
const SEMANA_ORINA = [
  { color: 2, veces: 6 },
  { color: 2, veces: 7 },
  { color: 2, veces: 6 },
  { color: 3, veces: 4 },
  { color: 2, veces: 6 },
  { color: 2, veces: 7 },
  { color: 2, veces: 6 },
];
const FASES_HIDRATACION = [450, 800, 1300, 1100, 900, 6000] as const;
function PantallaHidratacion({ activa, t }: PropsPantalla) {
  const fase = useFasesPantalla(activa, FASES_HIDRATACION);
  return (
    <>
      <Cristal on={fase >= 1} z={0} giro={-6} className="left-[2%] top-[6%] w-[74%]">
        <div className="flex items-center justify-between gap-[0.6em]">
          <Pastilla color={ORO}>{t.ahora_mismo}</Pastilla>
          <span className="text-[0.72em] text-text-muted">{t.llevas_hoy.replace("{n}", "5")}</span>
        </div>
        <p className="mt-[0.75em] text-[1.05em] font-medium">{t.que_color}</p>
        <div className="mt-[0.7em] grid grid-cols-4 gap-x-[0.3em] gap-y-[0.75em]">
          {ORINA.map((color, i) => {
            const esta = i === ELEGIDA;
            const elegida = esta && fase >= 3;
            return (
              <div key={color} className="entra flex flex-col items-center" data-on={fase >= 2} style={escalon(fase >= 2, i, 70)}>
                <Gota color={color} alto={2.35} turbia={i === TURBIA} elegida={esta ? fase >= 3 : undefined}>
                  {esta && (
                    <span className="transition-opacity duration-300" style={{ opacity: elegida ? 1 : 0, transitionDelay: elegida ? "500ms" : "0ms" }}>
                      <Check color="#0E2A2A" size="0.85em" />
                    </span>
                  )}
                </Gota>
                <span className={`mt-[0.3em] text-center text-[0.64em] leading-tight transition-colors duration-500 ${elegida ? "font-semibold text-text" : "text-text-muted"}`}>
                  {t.colores[i]}
                </span>
              </div>
            );
          })}
        </div>
      </Cristal>
      <Cristal on={fase >= 4} z={130} giro={-12} flota={3} className="right-[2%] top-[56%] w-[58%]">
        <div className="flex items-center justify-between gap-[0.6em]">
          <Pastilla color={JADE} late>
            {t.hidratacion}
          </Pastilla>
          <span className="text-[0.72em] text-text-muted">{t.esta_semana}</span>
        </div>
        <div className="mt-[0.8em] flex items-end justify-between px-[0.1em]">
          {SEMANA_ORINA.map((d, i) => (
            <div key={i} className="la-sube flex flex-col items-center gap-[0.3em]" data-on={fase >= 5} style={escalon(fase >= 5, i, 90)}>
              <Gota color={ORINA[d.color]} alto={1.35 + d.veces * 0.13} brillo={false}>
                <span className="text-[0.56em] font-bold" style={{ color: "#3A3320" }}>
                  {d.veces}
                </span>
              </Gota>
              <span className="text-[0.62em] font-semibold text-text-muted">{t.dias[i]}</span>
            </div>
          ))}
        </div>
        <div className="entra mt-[0.7em] flex items-start gap-[0.55em] border-t border-text/10 pt-[0.6em]" data-on={fase >= 5} style={escalon(fase >= 5, 1, 0, 800)}>
          <svg viewBox="0 0 54 70" width="0.7em" height="0.95em" aria-hidden className="mt-[0.15em] shrink-0">
            <path d={GOTA} fill={JADE} />
          </svg>
          <p className="text-[0.76em] leading-snug">
            <span className="font-semibold">{t.bien_hidratado}.</span> <span className="text-text-muted">{t.idea}</span>
          </p>
        </div>
      </Cristal>
    </>
  );
}

// La regla de las escalas del check-in, como en la app (components/checkin/Ruler.tsx): la pregunta y, a la
// derecha, la palabra de lo marcado en jade; debajo, la línea con sus 17 marcas (las de las 5 posiciones, más
// largas), el tramo hecho en degradado jade y un punto de luz que se desliza desde el centro hasta lo marcado;
// bajo los extremos, sus palabras. `valor` va de 1 a 5.
function Regla({ titulo, palabras, valor, on }: { titulo: string; palabras: string[]; valor: number; on: boolean }) {
  const p = on ? (valor - 1) / 4 : 0.5;
  return (
    <div className="mt-[0.75em]">
      <div className="flex items-baseline justify-between gap-[0.8em]">
        <p className="text-[0.9em] font-medium">{titulo}</p>
        <span className="text-[0.78em] font-medium text-accent transition-opacity duration-500" style={{ opacity: on ? 1 : 0, transitionDelay: on ? "500ms" : "0ms" }}>
          {palabras[valor - 1]}
        </span>
      </div>
      <div className="relative mx-[0.5em] mt-[0.45em] h-[1.9em]">
        <span className="absolute -inset-x-[0.5em] top-[0.6em] h-px bg-text/20" />
        <span className="la-regla-hecho absolute -left-[0.5em] top-[0.6em] h-px" style={{ width: `calc(${p * 100}% + 0.5em)`, opacity: on ? 1 : 0 }} />
        {Array.from({ length: 17 }, (_, i) => (
          <span
            key={i}
            className="absolute top-[1em] w-px -translate-x-1/2"
            style={{ left: `${(i / 16) * 100}%`, height: i % 4 === 0 ? "0.7em" : "0.35em", background: `rgb(240 239 230 / ${i % 4 === 0 ? 0.6 : 0.28})` }}
          />
        ))}
        <span className="la-regla-punto absolute top-[0.6em] h-[0.8em] w-[0.8em] -translate-x-1/2 -translate-y-1/2 rounded-full" data-on={on} style={{ left: `${p * 100}%` }} />
      </div>
      <div className="flex justify-between text-[0.64em] text-text-muted">
        <span>{palabras[0]}</span>
        <span>{palabras[palabras.length - 1]}</span>
      </div>
    </div>
  );
}

// Una curva suave que pasa por los puntos (Catmull-Rom convertida a Bézier), como las de la app
function curva(p: number[][]) {
  return p
    .map(([x, y], i) => {
      if (i === 0) return `M${x} ${y}`;
      const a = p[i - 2] ?? p[i - 1];
      const b = p[i - 1];
      const c = p[i + 1] ?? p[i];
      const c1 = [b[0] + (x - a[0]) / 6, b[1] + (y - a[1]) / 6];
      const c2 = [x - (c[0] - b[0]) / 6, y - (c[1] - b[1]) / 6];
      return `C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${x} ${y}`;
    })
    .join(" ");
}

// Tu semana: se dibuja la curva de la energía de cada día (de los check-ins), llega el check-in de hoy,
// la regla se desliza hasta «Bien» y, al final, llega la pausa guiada
const ENERGIA_SEMANA = [3, 2, 3, 4, 3, 5, 4]; // 1 agotado … 5 a tope, de lunes a domingo
const FASES_SEMANA = [450, 1300, 1100, 1300, 1700, 8000] as const;
function PantallaSemana({ activa, t }: PropsPantalla) {
  const fase = useFasesPantalla(activa, FASES_SEMANA);
  const x = (i: number) => 14 + i * 42;
  const y = (v: number) => 74 - ((v - 1) / 4) * 58;
  const linea = curva(ENERGIA_SEMANA.map((v, i) => [x(i), y(v)]));
  return (
    <>
      <Cristal on={fase >= 1} z={0} giro={-6} className="left-[2%] top-[5%] w-[70%]">
        <div className="flex items-center justify-between gap-[0.6em]">
          <Pastilla color={JADE} late>
            {t.semana_titulo}
          </Pastilla>
          <span className="text-[0.72em] text-text-muted">{t.semana_sub}</span>
        </div>
        <svg viewBox="0 0 280 84" className="mt-[0.7em] h-auto w-full overflow-visible" aria-hidden>
          {[1, 3, 5].map((v) => (
            <line key={v} x1="0" x2="280" y1={y(v)} y2={y(v)} stroke="rgb(240 239 230 / 0.09)" strokeWidth="1" />
          ))}
          <path d={`${linea} L${x(6)} 80 L${x(0)} 80 Z`} fill="url(#la-energia)" className="transition-opacity duration-700" style={{ opacity: fase >= 2 ? 1 : 0, transitionDelay: fase >= 2 ? "700ms" : "0ms" }} />
          <path d={linea} fill="none" stroke={JADE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" pathLength={1} className="trazo trazo-lento" data-on={fase >= 2} />
          <defs>
            <linearGradient id="la-energia" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={JADE} stopOpacity="0.2" />
              <stop offset="100%" stopColor={JADE} stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <div className="mt-[0.2em] flex justify-between px-[0.1em] text-[0.66em] font-semibold text-text-muted">
          {t.dias.map((d, i) => (
            <span key={i} className="w-[1.4em] text-center" style={i === 6 ? { color: MARFIL } : undefined}>
              {d}
            </span>
          ))}
        </div>
      </Cristal>
      <Cristal on={fase >= 3} z={130} giro={-12} flota={2} className="right-[2%] top-[45%] w-[56%]">
        <Pastilla color={JADE}>{t.checkin}</Pastilla>
        <Regla titulo={t.energia_pregunta} palabras={t.energia} valor={4} on={fase >= 4} />
      </Cristal>
      <Cristal on={fase >= 5} z={70} giro={-8} flota={4} reflejo={false} className="left-[5%] top-[71%] w-[40%]">
        <div className="flex items-center gap-[0.8em]">
          <div className="relative flex h-[4.4em] w-[4.4em] shrink-0 items-center justify-center">
            <span className="la-respira absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgb(131 214 180 / 0.5) 0%, rgb(131 214 180 / 0.26) 45%, rgb(131 214 180 / 0.08) 75%, transparent 100%)" }} />
            <span className="relative grid text-[0.68em] font-medium text-text">
              <span className="la-inspira col-start-1 row-start-1 text-center">{t.inspira}</span>
              <span className="la-espira col-start-1 row-start-1 text-center">{t.espira}</span>
            </span>
          </div>
          <div>
            <p className="text-[0.86em] font-medium leading-tight">{t.ejercicio}</p>
            <p className="mt-[0.2em] text-[0.7em] text-text-muted">{t.ejercicio_detalle}</p>
          </div>
        </div>
      </Cristal>
    </>
  );
}

// Tu ciclo: el anillo de las cuatro fases (los colores del prototipo de la app nueva, más apagados) se dibuja, la
// marca va al día 9 y delante llega la próxima regla prevista, contando los días que faltan, con la misma
// frase que la app («Según tus últimos ciclos…», hometest-app 6dd588a)
const CICLO = 28;
const FASES_CICLO_APP = [
  { color: "#B96F7B", desde: 1, hasta: 5 },
  { color: "#5CC7C9", desde: 6, hasta: 12 },
  { color: "#D8B978", desde: 13, hasta: 15 },
  { color: "#83D6B4", desde: 16, hasta: 28 },
];
const DIA_CICLO = 9;
const RC = 40;
const CC = 2 * Math.PI * RC;
const FALTAN = CICLO - DIA_CICLO + 1;
const FASES_CICLO = [450, 1500, 1200, 6000] as const;
function PantallaCiclo({ activa, t }: PropsPantalla) {
  const fase = useFasesPantalla(activa, FASES_CICLO);
  const actual = FASES_CICLO_APP.findIndex((f) => DIA_CICLO >= f.desde && DIA_CICLO <= f.hasta);
  const angulo = ((DIA_CICLO - 0.5) / CICLO) * 360;
  return (
    <>
      <Cristal on={fase >= 1} z={0} giro={-6} className="left-[2%] top-[9%] w-[72%]">
        <Pastilla color="#5CC7C9" late>
          {t.ciclo}
        </Pastilla>
        <div className="mt-[0.9em] flex items-center gap-[1.1em]">
          <div className="relative h-[6.8em] w-[6.8em] shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 overflow-visible">
              {FASES_CICLO_APP.map((f, i) => {
                const largo = ((f.hasta - f.desde + 1) / CICLO) * CC - 2.5;
                const inicio = ((f.desde - 1) / CICLO) * CC;
                const on = fase >= 1;
                return (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r={RC}
                    fill="none"
                    stroke={f.color}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${on ? largo : 0} ${CC}`}
                    strokeDashoffset={-inicio}
                    className="transition-[stroke-dasharray] duration-700 ease-out"
                    style={{ transitionDelay: on ? `${300 + i * 250}ms` : "0ms", opacity: i === actual ? 1 : 0.55 }}
                  />
                );
              })}
              <g className="transition-transform duration-[1200ms] ease-out" style={{ transform: `rotate(${fase >= 2 ? angulo : 0}deg)`, transformOrigin: "50px 50px" }}>
                <g className="transition-opacity duration-300" style={{ opacity: fase >= 2 ? 1 : 0 }}>
                  <circle cx={50 + RC} cy="50" r="8" fill={MARFIL} opacity="0.22" />
                  <circle cx={50 + RC} cy="50" r="4" fill="#F7F3E6" />
                </g>
              </g>
            </svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
              <span className="text-[1.3em] font-light tabular-nums">{t.ciclo_dia.replace("{d}", String(DIA_CICLO))}</span>
              <span className="mt-[0.25em] text-[0.62em] font-semibold text-text-muted">{t.ciclo_de.replace("{n}", String(CICLO))}</span>
            </span>
          </div>
          <div className="entra" data-on={fase >= 2} style={escalon(fase >= 2, 1, 0, 900)}>
            <p className="flex items-center gap-[0.45em] text-[1em] font-medium">
              <span className="h-[0.6em] w-[0.6em] rounded-full" style={{ background: FASES_CICLO_APP[actual].color }} />
              {t.fase_actual}
            </p>
            <p className="mt-[0.3em] text-[0.82em] leading-snug text-text-muted">{t.fase_texto}</p>
          </div>
        </div>
        <div className="entra mt-[0.9em] flex flex-wrap gap-x-[0.9em] gap-y-[0.3em] border-t border-text/10 pt-[0.6em] text-[0.7em]" data-on={fase >= 2} style={escalon(fase >= 2, 1, 0, 1200)}>
          {FASES_CICLO_APP.map((f, i) => (
            <span key={i} className={`flex items-center gap-[0.4em] ${i === actual ? "font-semibold text-text" : "text-text-muted"}`}>
              <span className="h-[0.55em] w-[0.55em] rounded-full" style={{ background: f.color }} />
              {t.fases[i]}
            </span>
          ))}
        </div>
      </Cristal>
      <Cristal on={fase >= 3} z={130} giro={-12} flota={2} className="right-[3%] top-[60%] w-[50%]">
        <div className="flex items-center gap-[0.9em]">
          <span className="flex h-[3.2em] w-[3.2em] shrink-0 flex-col items-center justify-center rounded-full leading-none" style={{ background: "rgb(185 111 123 / 0.2)" }}>
            <span className="text-[1.35em] font-light tabular-nums" style={{ color: "#E3A9B2" }}>
              <Contador hasta={FALTAN} activo={fase >= 3} duracion={1200} />
            </span>
            <span className="mt-[0.15em] text-[0.55em] font-semibold text-text-muted">{t.proxima_dias}</span>
          </span>
          <div>
            <p className="text-[0.9em] font-medium leading-tight">{t.proxima_titulo}</p>
            <p className="mt-[0.25em] text-[0.74em] leading-snug text-text-muted">{t.proxima_texto.replace("{n}", String(FALTAN))}</p>
          </div>
        </div>
      </Cristal>
    </>
  );
}

// El agua: el anillo se llena con lo de hoy, crecen las barras de la semana, se pulsa «un vaso» y
// todo sube 250 ml
const OBJETIVO = 1800;
const AGUA_SEMANA = [1500, 1800, 1250, 2000, 1600, 1900];
const R = 42;
const C = 2 * Math.PI * R;
const FASES_AGUA = [450, 1500, 1000, 900, 5600] as const;
function PantallaAgua({ activa, t, idioma }: PropsPantalla) {
  const fase = useFasesPantalla(activa, FASES_AGUA);
  const vaso = fase >= 4;
  const hoy = vaso ? 1500 : 1250;
  const semana = [...AGUA_SEMANA, hoy];
  return (
    <>
      <Cristal on={fase >= 1} z={0} giro={-6} className="left-[2%] top-[12%] w-[70%]">
        <Pastilla color={AGUA} late>
          {t.agua_hoy}
        </Pastilla>
        <div className="mt-[0.9em] flex items-center gap-[1em]">
          <div className="relative h-[5.6em] w-[5.6em] shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r={R} fill="none" stroke="rgb(240 239 230 / 0.1)" strokeWidth="3" />
              <circle
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke="url(#la-anillo-agua)"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={fase >= 1 ? C * (1 - hoy / OBJETIVO) : C}
                className="transition-[stroke-dashoffset] duration-[1400ms] ease-out"
                style={fase === 0 ? { transition: `stroke-dashoffset 0s ${REINICIO_MS}ms` } : undefined}
              />
              {/* El punto de luz de la punta gira a la vez que se llena el anillo */}
              <g
                className="transition-transform duration-[1400ms] ease-out"
                style={{ transform: `rotate(${fase >= 1 ? (hoy / OBJETIVO) * 360 : 0}deg)`, transformOrigin: "50px 50px", ...(fase === 0 ? { transition: `transform 0s ${REINICIO_MS}ms` } : {}) }}
              >
                <circle cx={50 + R} cy="50" r="6.5" fill={AGUA} opacity="0.3" />
                <circle cx={50 + R} cy="50" r="2.8" fill="#F7F3E6" />
              </g>
              <defs>
                <linearGradient id="la-anillo-agua" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3F7FAE" />
                  <stop offset="100%" stopColor={AGUA} />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
              <span className="text-[1.6em] font-light tabular-nums">
                <Contador key={vaso ? "b" : "a"} desde={vaso ? 1.25 : 0} hasta={hoy / 1000} activo={fase >= 1} duracion={1300} decimales={2} idioma={idioma} />
              </span>
              <span className="mt-[0.2em] text-[0.62em] font-semibold text-text-muted">{t.litros}</span>
            </span>
          </div>
          <div>
            <p className="text-[1.05em] font-medium">{t.objetivo}</p>
            <p className="entra mt-[0.15em] text-[0.85em] text-text-muted" data-on={fase >= 2}>
              {t.bebidas}
            </p>
          </div>
        </div>
        <div className="mt-[1em] flex items-end gap-[0.7em] border-t border-text/10 pt-[0.8em]">
          <span className="flex-1 text-[0.82em] text-text-muted">{t.esta_semana}</span>
          <div className="flex h-[2.6em] items-end gap-[0.35em]">
            {semana.map((ml, i) => (
              <span key={i} className="flex h-full w-[0.4em] items-end rounded-full bg-[#74B9E8]/15">
                <span
                  className="la-barra w-full rounded-full"
                  data-on={fase >= 2}
                  style={{ height: `${Math.min(1, ml / OBJETIVO) * 100}%`, background: AGUA, opacity: i === 6 ? 1 : ml >= OBJETIVO ? 0.8 : 0.45, ...escalon(fase >= 2, i, 80) }}
                />
              </span>
            ))}
          </div>
        </div>
      </Cristal>
      <Cristal on={fase >= 3} z={140} giro={-12} flota={1} className="right-[4%] top-[58%] w-[42%]">
        <div className="relative">
          <span className="flex items-center justify-center rounded-full bg-[#17634B] py-[0.55em] text-[0.86em] font-medium text-[#F0EFE6]" data-pulsa={vaso}>
            {t.un_vaso}
          </span>
          <span className="la-suma absolute -top-[1.6em] right-[0.6em] text-[0.85em] font-semibold text-accent" data-on={vaso}>
            {t.suma}
          </span>
          <p className="mt-[0.55em] text-center text-[0.74em] text-text-muted">{t.un_toque}</p>
        </div>
      </Cristal>
    </>
  );
}

// La digestión: entran las siete formas en oro, se elige la 4 (en jade) y delante llega «Noto algo» (las molestias
// de la app, types/digestion.ts), donde se marca ardor o reflujo, leve
const FASES_DIGESTION = [450, 800, 1200, 1100, 1000, 6000] as const;
function PantallaDigestion({ activa, t }: PropsPantalla) {
  const fase = useFasesPantalla(activa, FASES_DIGESTION);
  const forma = fase >= 3;
  return (
    <>
      <Cristal on={fase >= 1} z={0} giro={-6} className="left-[2%] top-[12%] w-[74%]">
        <div className="flex items-center justify-between gap-[0.6em]">
          <Pastilla color={ORO}>{t.digestion}</Pastilla>
          <span className="text-[0.72em] text-text-muted">{t.llevas_hoy.replace("{n}", "1")}</span>
        </div>
        <p className="mt-[0.75em] text-[1.05em] font-medium">{t.consistencia}</p>
        <div className="mt-[0.6em] flex justify-between">
          {[1, 2, 3, 4, 5, 6, 7].map((b, i) => {
            const esta = forma && b === 4;
            return (
              <span
                key={b}
                className="entra flex h-[2.4em] w-[2.4em] items-center justify-center rounded-[0.6em] border"
                data-on={fase >= 2}
                style={{
                  ...escalon(fase >= 2, i, 70),
                  borderColor: esta ? "rgb(131 214 180 / 0.6)" : "rgb(240 239 230 / 0.1)",
                  background: esta ? "rgb(131 214 180 / 0.1)" : "rgb(240 239 230 / 0.045)",
                  transitionProperty: "opacity, transform, border-color, background-color",
                  transitionDuration: "600ms, 750ms, 500ms, 500ms",
                  transitionTimingFunction: "ease, cubic-bezier(.2,.7,.2,1), ease, ease",
                }}
              >
                <Bristol tipo={b} size="1.5em" />
              </span>
            );
          })}
        </div>
        <p className="mt-[0.45em] h-[1.3em] text-center text-[0.82em] font-medium text-accent transition-opacity duration-500" style={{ opacity: forma ? 1 : 0 }}>
          {t.elegida}
        </p>
      </Cristal>
      <Cristal on={fase >= 4} z={120} giro={-12} flota={2.5} className="right-[3%] top-[52%] w-[54%]">
        <p className="text-[0.92em] font-medium">{t.noto_algo}</p>
        <div className="mt-[0.55em] flex flex-wrap gap-[0.35em]">
          {t.molestias.map((m, i) => (
            <Opcion key={m} on={fase >= 5 && i === 0}>
              {m}
            </Opcion>
          ))}
        </div>
        <div className="mt-[0.7em] flex items-center gap-[0.6em] border-t border-text/10 pt-[0.6em]">
          <span className="text-[0.74em] text-text-muted">{t.molestia_intensidad}</span>
          <span className="flex gap-[0.3em]">
            {t.molestia_niveles.map((n, i) => (
              <Opcion key={n} on={fase >= 5 && i === 0} retraso={500}>
                {n}
              </Opcion>
            ))}
          </span>
        </div>
      </Cristal>
    </>
  );
}

// Una opción en píldora de borde fino que se marca en jade (molestias, intensidad)
const Opcion = ({ on, retraso = 0, children }: { on: boolean; retraso?: number; children: ReactNode }) => (
  <span
    className="rounded-full border px-[0.7em] py-[0.25em] text-[0.7em] font-medium transition-colors duration-500"
    style={{
      borderColor: on ? "rgb(131 214 180 / 0.55)" : "rgb(240 239 230 / 0.16)",
      background: on ? "rgb(131 214 180 / 0.1)" : "transparent",
      color: on ? JADE : "rgb(var(--color-text-muted))",
      transitionDelay: on ? `${retraso}ms` : "0ms",
    }}
  >
    {children}
  </span>
);

// Un círculo vacío que se rellena de jade con su check al marcarse (comidas, ejercicios)
const Marca = ({ on, retraso = 0 }: { on: boolean; retraso?: number }) => (
  <span
    className="flex h-[1.35em] w-[1.35em] shrink-0 items-center justify-center rounded-full border transition-colors duration-500"
    style={{ borderColor: on ? JADE : "rgb(240 239 230 / 0.28)", background: on ? JADE : "transparent", transitionDelay: on ? `${retraso}ms` : "0ms" }}
  >
    <span className="transition-opacity duration-300" style={{ opacity: on ? 1 : 0, transitionDelay: on ? `${retraso + 200}ms` : "0ms" }}>
      <Check color="#0A1D19" size="0.85em" />
    </span>
  </span>
);

// El menú de hoy (va con suscripción en la app): entran las tres comidas con su foto (las de las recetas
// de la app, hometest-app/assets/images/recipes, copiadas en public/images/inicio/app), se marcan dos
// y delante llega el reparto del día en un donut fino que se dibuja, con los colores del de la app
// (diet/MacroDonut.tsx): proteína en jade, hidratos en oro y grasa en marfil apagado
const FASES_MENU = [450, 900, 1300, 1100, 6000] as const;
const MACROS = [28, 45, 27]; // % de la energía: proteína, hidratos, grasa
const MACRO_COLORES = [JADE, ORO, "#B4BDB6"];
const RD = 38;
const CD = 2 * Math.PI * RD;
function PantallaMenu({ activa, t, idioma }: PropsPantalla) {
  const fase = useFasesPantalla(activa, FASES_MENU);
  let acumulado = 0;
  return (
    <>
      <Cristal on={fase >= 1} z={0} giro={-6} className="left-[2%] top-[10%] w-[74%]">
        <div className="flex items-center justify-between gap-[0.6em]">
          <Pastilla color={ORO}>{t.menu_plan}</Pastilla>
          <span className="text-[0.72em] text-text-muted transition-opacity duration-500" style={{ opacity: fase >= 3 ? 1 : 0, transitionDelay: fase >= 3 ? "700ms" : "0ms" }}>
            {t.menu_hechas}
          </span>
        </div>
        <p className="mt-[0.75em] text-[1.05em] font-medium">{t.menu_titulo}</p>
        <ul className="mt-[0.4em] divide-y divide-text/10">
          {t.comidas.map((c, i) => (
            <li key={c.momento} className="entra flex items-center gap-[0.8em] py-[0.5em]" data-on={fase >= 2} style={escalon(fase >= 2, i, 140)}>
              <span className="relative h-[2.9em] w-[2.9em] shrink-0 overflow-hidden rounded-[0.6em] bg-bg-soft">
                <Image src={c.foto} alt="" fill sizes="64px" className="object-cover" />
              </span>
              <span className="flex-1 leading-snug">
                <span className="block text-[0.62em] font-semibold uppercase tracking-[0.1em] text-text-muted">{c.momento}</span>
                <span className="block text-[0.84em] font-medium">{c.plato}</span>
              </span>
              <Marca on={fase >= 3 && i < 2} retraso={i * 300} />
            </li>
          ))}
        </ul>
      </Cristal>
      <Cristal on={fase >= 4} z={130} giro={-12} flota={2} className="right-[3%] top-[63%] w-[50%]">
        <p className="text-[0.82em] font-medium">{t.macros_titulo}</p>
        <div className="mt-[0.6em] flex items-center gap-[1em]">
          <div className="relative h-[4.6em] w-[4.6em] shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r={RD} fill="none" stroke="rgb(240 239 230 / 0.08)" strokeWidth="5" />
              {MACROS.map((pct, i) => {
                const largo = (CD * pct) / 100 - 3;
                const inicio = acumulado;
                acumulado += (CD * pct) / 100;
                const on = fase >= 4;
                return (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r={RD}
                    fill="none"
                    stroke={MACRO_COLORES[i]}
                    strokeWidth="5"
                    strokeDasharray={`${on ? largo : 0} ${CD}`}
                    strokeDashoffset={-inicio}
                    className="transition-[stroke-dasharray] duration-[900ms] ease-out"
                    style={{ transitionDelay: on ? `${300 + i * 250}ms` : "0ms" }}
                  />
                );
              })}
            </svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
              <span className="text-[1.05em] font-light tabular-nums">
                <Contador hasta={1850} activo={fase >= 4} duracion={1400} idioma={idioma} />
              </span>
              <span className="mt-[0.15em] text-[0.55em] font-semibold text-text-muted">kcal</span>
            </span>
          </div>
          <ul className="flex-1 space-y-[0.35em] text-[0.76em]">
            {t.macros.map((m, i) => (
              <li key={m} className="flex items-center gap-[0.5em]">
                <span className="h-[0.6em] w-[0.6em] rounded-full" style={{ background: MACRO_COLORES[i] }} />
                <span className="flex-1 text-text-muted">{m}</span>
                <span className="font-medium tabular-nums">{MACROS[i]} %</span>
              </li>
            ))}
          </ul>
        </div>
      </Cristal>
    </>
  );
}

// Medicación y suplementos: las tomas de hoy (la primera ya tomada), llega el recordatorio de la
// segunda y se marca como tomada
const FASES_MEDICACION = [450, 900, 1300, 1400, 6000] as const;
function PantallaMedicacion({ activa, t }: PropsPantalla) {
  const fase = useFasesPantalla(activa, FASES_MEDICACION);
  const tomada = (i: number) => i === 0 || (i === 1 && fase >= 4);
  return (
    <>
      <Cristal on={fase >= 1} z={0} giro={-6} className="left-[2%] top-[10%] w-[74%]">
        <div className="flex items-center justify-between gap-[0.6em]">
          <Pastilla color={JADE}>{t.medicacion}</Pastilla>
          <span className="flex items-center gap-[0.35em] text-[0.72em] text-text-muted">
            <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden>
              <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16Zm4 4h4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t.recordatorios}
          </span>
        </div>
        <p className="mt-[0.75em] text-[1.05em] font-medium">{t.hoy}</p>
        <ul className="mt-[0.4em] divide-y divide-text/10">
          {t.tomas.map((d, i) => (
            <li key={d.hora} className="entra flex items-center gap-[0.8em] py-[0.6em]" data-on={fase >= 2} style={escalon(fase >= 2, i, 140)}>
              <span className="w-[2.9em] shrink-0 text-[0.95em] font-light tabular-nums">{d.hora}</span>
              <span className="flex-1 leading-tight">
                <span className="block text-[0.86em] font-medium">{d.nombre}</span>
                <span className="block text-[0.72em] text-text-muted">{d.dosis}</span>
              </span>
              {tomada(i) ? (
                <span className="flex items-center gap-[0.3em] rounded-full border border-accent/40 px-[0.7em] py-[0.25em] text-[0.72em] font-medium text-accent">
                  <Check color={JADE} size="0.9em" />
                  {t.tomada}
                </span>
              ) : (
                <span className="flex gap-[0.35em] text-[0.72em] font-medium">
                  <span className="rounded-full border border-text/15 px-[0.7em] py-[0.25em] text-text-muted">{t.omitir}</span>
                  <span className="rounded-full bg-[#17634B] px-[0.7em] py-[0.25em] text-[#F0EFE6]">{t.tomada}</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </Cristal>
      <Cristal on={fase >= 3} z={130} giro={-12} flota={1.5} className="right-[3%] top-[60%] w-[50%]">
        <div className="flex items-start gap-[0.75em]">
          <span className="flex h-[2.2em] w-[2.2em] shrink-0 items-center justify-center rounded-[0.6em] border border-gold/40 bg-[#0E2A24] font-logo text-[0.95em] font-semibold text-gold">K</span>
          <div className="flex-1">
            <p className="flex justify-between text-[0.7em] text-text-muted">
              <span>{t.recordatorio}</span>
              <span>14:00</span>
            </p>
            <p className="mt-[0.15em] text-[0.88em] font-medium leading-tight">
              {t.tomas[1].nombre} · {t.tomas[1].dosis}
            </p>
          </div>
        </div>
      </Cristal>
    </>
  );
}

// Una escala de opciones en píldoras de borde fino (cómo ha ido el entreno); la elegida, en jade
function Escala({ opciones, elegida, on }: { opciones: string[]; elegida: number; on: boolean }) {
  return (
    <div className="mt-[0.45em] flex gap-[0.3em]">
      {opciones.map((o, i) => {
        const esta = on && i === elegida;
        return (
          <span
            key={o}
            className="flex-1 rounded-full border py-[0.3em] text-center text-[0.66em] font-medium transition-colors duration-500"
            style={{ borderColor: esta ? "rgb(131 214 180 / 0.55)" : "rgb(240 239 230 / 0.16)", background: esta ? "rgb(131 214 180 / 0.1)" : "transparent", color: esta ? JADE : "rgb(var(--color-text-muted))" }}
          >
            {o}
          </span>
        );
      })}
    </div>
  );
}
// El entreno: entran los ejercicios de la sesión, se van marcando, delante sale «¡Sesión hecha!» con
// cómo ha ido y la semana pasa a 3 de 3
const FASES_ENTRENO = [450, 900, 2100, 1200, 6000] as const;
function PantallaEntreno({ activa, t }: PropsPantalla) {
  const fase = useFasesPantalla(activa, FASES_ENTRENO);
  const hecha = fase >= 4;
  return (
    <>
      <Cristal on={fase >= 1} z={0} giro={-6} className="left-[2%] top-[8%] w-[74%]">
        <div className="flex items-center justify-between gap-[0.6em]">
          <Pastilla color={ORO}>{t.entreno_plan}</Pastilla>
          <span className="text-[0.72em] tabular-nums text-text-muted">{t.entreno_semana.replace("{done}", hecha ? "3" : "2").replace("{total}", "3")}</span>
        </div>
        <p className="mt-[0.75em] text-[1.05em] font-medium">{t.entreno_titulo}</p>
        <p className="text-[0.74em] text-text-muted">{t.entreno_extra}</p>
        <ul className="mt-[0.35em] divide-y divide-text/10">
          {t.ejercicios.map((e, i) => (
            <li key={e.nombre} className="entra flex items-center gap-[0.8em] py-[0.5em]" data-on={fase >= 2} style={escalon(fase >= 2, i, 120)}>
              <span className="flex-1 text-[0.86em] font-medium">{e.nombre}</span>
              <span className="text-[0.74em] tabular-nums text-text-muted">{e.dosis}</span>
              <Marca on={fase >= 3} retraso={i * 450} />
            </li>
          ))}
        </ul>
      </Cristal>
      <Cristal on={hecha} z={130} giro={-12} flota={2} className="right-[3%] top-[63%] w-[50%]">
        <p className="text-[0.95em] font-medium">{t.sesion_hecha}</p>
        <p className="mt-[0.15em] text-[0.76em] text-text-muted">{t.que_tal}</p>
        <Escala opciones={t.intensidad} elegida={1} on={hecha} />
      </Cristal>
    </>
  );
}

// Orden de la lista (el mismo que content/inicio.json → app.funciones), lo que se queda cada pantalla
// antes de pasar a la siguiente (la del check-in, más: así se ve una respiración entera) y los brillos de
// detrás del cristal, siempre de la paleta de la marca (oro, salvia, crema; el agua, azul gris)
const PANTALLAS: { Pantalla: (p: PropsPantalla) => ReactNode; ms: number; brillos: string[] }[] = [
  { Pantalla: PantallaSemana, ms: 13000, brillos: ["#8FB3A0", "#E9C77E", "#6F8C7C"] },
  { Pantalla: PantallaMedicacion, ms: 8500, brillos: ["#6F8C7C", "#C9A36B", "#E6D3A3"] },
  { Pantalla: PantallaMenu, ms: 8000, brillos: ["#C9A36B", "#8FB3A0", "#E6D3A3"] },
  { Pantalla: PantallaEntreno, ms: 9500, brillos: ["#C9A36B", "#6F8C7C", "#8FB3A0"] },
  { Pantalla: PantallaCiclo, ms: 8000, brillos: ["#5CC7C9", "#B96F7B", "#6F8C7C"] },
  { Pantalla: PantallaAgua, ms: 8500, brillos: ["#8FAAC2", "#6F8C7C", "#C9A36B"] },
  { Pantalla: PantallaHidratacion, ms: 9000, brillos: ["#D8C08A", "#6F8C7C", "#C9A36B"] },
  { Pantalla: PantallaDigestion, ms: 8000, brillos: ["#C9A36B", "#6F8C7C", "#E6D3A3"] },
];

export default function LaApp({ copy, lang }: { copy: Copy; lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  const giro = useRef<HTMLDivElement>(null);
  const visible = useEnPantalla(ref, 0.3);
  const menos = useMenosMovimiento();
  const [activa, setActiva] = useState(0);
  const [pausa, setPausa] = useState(false);
  const idioma = lang === "en" ? "en-GB" : "es-ES";

  useEffect(() => {
    if (!visible || pausa || menos) return;
    const t = setTimeout(() => setActiva((n) => (n + 1) % PANTALLAS.length), PANTALLAS[activa].ms);
    return () => clearTimeout(t);
  }, [visible, pausa, menos, activa]);

  // Las tarjetas siguen un poco al ratón (variables CSS, sin pasar por React)
  const inclinar = (x: number, y: number) => {
    giro.current?.style.setProperty("--ix", String(x));
    giro.current?.style.setProperty("--iy", String(y));
  };
  const mover = (e: PointerEvent<HTMLDivElement>) => {
    if (menos || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    inclinar(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
  };

  return (
    <section ref={ref} id="la-app" className="relative isolate scroll-mt-20 overflow-hidden bg-ink py-20 text-on-accent sm:py-28">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden opacity-60">
        <Image src="/images/inicio/capas-verde-movil.jpg" alt="" fill sizes="100vw" className="deriva-lenta object-cover sm:hidden" />
        <Image src="/images/inicio/capas-verde.jpg" alt="" fill sizes="100vw" className="deriva-lenta hidden object-cover sm:block" />
      </div>

      <Container>
        {/* En el móvil: texto, tarjetas y lista; en escritorio, texto y lista a la izquierda y las
            tarjetas a la derecha */}
        <div className="grid items-center gap-x-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:grid-rows-[auto_auto]">
          <div className="order-1 max-w-xl self-end lg:order-none">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{copy.eyebrow}</p>
            <h2 className="mt-4 font-display text-4xl font-normal leading-[1.08] tracking-tight sm:text-5xl">
              {copy.titulo}
              <span className="block italic text-gold">{copy.titulo_2}</span>
            </h2>
            <p className="mt-5 max-w-lg text-lg text-on-accent/70">{copy.texto}</p>
          </div>

          <div className="order-3 max-w-xl self-start lg:order-none lg:col-start-1 lg:row-start-2">
            <ol className="mt-2 flex flex-col gap-1 lg:mt-9" onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)}>
              {copy.funciones.map((f, i) => {
                const on = i === activa;
                return (
                  <li key={f.titulo}>
                    <button
                      type="button"
                      onClick={() => setActiva(i)}
                      aria-pressed={on}
                      data-medir={`La app: ${f.titulo}`}
                      className={`group relative w-full overflow-hidden rounded-2xl px-5 py-3 text-left transition-colors duration-300 ${on ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"}`}
                    >
                      <span className="flex items-baseline gap-4">
                        <span className={`font-display text-sm tabular-nums transition-colors ${on ? "text-gold" : "text-on-accent/40"}`}>0{i + 1}</span>
                        <span className={`text-lg font-semibold transition-colors ${on ? "text-on-accent" : "text-on-accent/60"}`}>{f.titulo}</span>
                      </span>
                      <span className={`grid transition-[grid-template-rows] duration-500 ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                        <span className="overflow-hidden">
                          <span className="block pl-9 pt-1.5 text-on-accent/65">{f.texto}</span>
                        </span>
                      </span>
                      {on && !menos && visible && !pausa && (
                        <span key={activa} aria-hidden className="la-progreso absolute bottom-0 left-5 right-5 h-px origin-left bg-gold/70" style={{ animationDuration: `${PANTALLAS[activa].ms}ms` }} />
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
            <p className="mt-6 pl-5 text-sm text-on-accent/45">{copy.nota}</p>
          </div>

          {/* Escenario: brillos detrás y las tarjetas de cristal flotando delante */}
          <div
            aria-hidden
            className="escena la-escenario relative order-2 mx-auto my-6 aspect-square w-full max-w-[600px] sm:aspect-[6/5] lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1"
            onPointerMove={mover}
            onPointerLeave={() => inclinar(0, 0)}
          >
            <div className="absolute inset-0">
              {PANTALLAS[activa].brillos.map((c, i) => (
                <span key={i} className={`la-brillo la-brillo-${i}`} style={{ background: c }} />
              ))}
            </div>
            <div ref={giro} className="la-giro escena-ui absolute inset-0">
              <div className="la-vaiven absolute inset-0">
                {PANTALLAS.map(({ Pantalla }, i) => (
                  <div key={i} className="la-3d absolute inset-0">
                    <Pantalla activa={i === activa && visible} t={copy.pantallas} idioma={idioma} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

const CSS = `
.la-escenario { perspective: 1300px; perspective-origin: 50% 45%; }
.la-3d, .la-giro, .la-vaiven { transform-style: preserve-3d; }
.la-giro { --ix: 0; --iy: 0; transform: rotateX(calc(var(--iy) * -7deg)) rotateY(calc(var(--ix) * 10deg)); transition: transform 900ms cubic-bezier(.2,.7,.2,1); }
.la-vaiven { animation: la-vaiven 14s ease-in-out infinite; }
.la-cristal {
  transform-style: preserve-3d; opacity: 0; pointer-events: none;
  transform: translate3d(0, 2.2em, calc(var(--z) - 240px)) rotateX(16deg) rotateY(calc(var(--g) + 10deg));
  transition: opacity 500ms ease, transform 1100ms cubic-bezier(.16,.84,.24,1);
}
.la-cristal[data-on="true"] { opacity: 1; transform: translate3d(0, 0, var(--z)) rotateY(var(--g)); }
.la-flota { transform-style: preserve-3d; animation: la-flota 6s ease-in-out infinite; }
.la-vidrio { position: relative; overflow: hidden; box-shadow: 0 1.6em 3.2em -1.4em rgb(0 0 0 / 0.65), inset 0 1px 0 rgb(240 239 230 / 0.08); }
/* Un reflejo que cruza el cristal cuando entra: en cristal oscuro, apenas un brillo */
.la-vidrio::after {
  content: ""; position: absolute; inset: -20% -60%; pointer-events: none; transform: translateX(-70%);
  background: linear-gradient(105deg, transparent 40%, rgb(240 239 230 / 0.06) 50%, transparent 60%);
}
.la-cristal[data-on="true"] .la-vidrio::after { transform: translateX(70%); transition: transform 1800ms cubic-bezier(.3,.6,.3,1) 250ms; }
.la-sin-reflejo::after { display: none; }
.la-brillo { position: absolute; border-radius: 9999px; filter: blur(80px); opacity: 0.45; transition: background-color 1200ms ease; }
.la-brillo-0 { left: 8%; top: 12%; width: 46%; height: 46%; animation: la-deriva-a 16s ease-in-out infinite; }
.la-brillo-1 { right: 6%; bottom: 10%; width: 42%; height: 42%; animation: la-deriva-b 19s ease-in-out infinite; }
.la-brillo-2 { left: 30%; top: 40%; width: 34%; height: 34%; opacity: 0.3; animation: la-deriva-a 23s ease-in-out infinite reverse; }
.la-sube { opacity: 0; transform: translateY(0.9em) scale(0.6); transform-origin: bottom; transition: opacity 400ms ease, transform 650ms cubic-bezier(.3,1.5,.5,1); }
.la-sube[data-on="true"] { opacity: 1; transform: none; }
.la-barra { transform: scaleY(0); transform-origin: bottom; transition: transform 700ms cubic-bezier(.2,.8,.2,1), height 700ms ease; }
.la-barra[data-on="true"] { transform: scaleY(1); }
[data-pulsa="true"] { animation: la-pulsa 450ms ease; }
.la-suma { opacity: 0; transform: translateY(0.4em); }
.la-suma[data-on="true"] { animation: la-suma 1600ms ease-out forwards; }
.la-progreso { animation-name: la-progreso; animation-timing-function: linear; animation-fill-mode: both; }
@keyframes la-progreso { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes la-flota { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes la-vaiven { 0%, 100% { transform: rotateY(-3deg) rotateX(1deg); } 50% { transform: rotateY(3deg) rotateX(-1deg); } }
@keyframes la-deriva-a { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(12%, 8%); } }
@keyframes la-deriva-b { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-10%, -12%); } }
@keyframes la-pulsa { 40% { transform: scale(0.94); } 100% { transform: scale(1); } }
/* La regla del check-in: el tramo hecho y el punto de luz se deslizan hasta lo marcado */
.la-regla-hecho { background: linear-gradient(90deg, #2F8F70, #83D6B4); transition: width 900ms cubic-bezier(.2,.7,.2,1), opacity 400ms ease; }
.la-regla-punto { background: #8D9E95; transition: left 900ms cubic-bezier(.2,.7,.2,1), background-color 400ms ease, box-shadow 600ms ease; }
.la-regla-punto[data-on="true"] { background: #F7F3E6; box-shadow: 0 0 0 0.28em rgb(131 214 180 / 0.2), 0 0 1.1em 0.25em rgb(131 214 180 / 0.5); }
/* La pausa guiada: inspira 4 s, espira 6 s (empieza al aparecer la tarjeta) */
.la-respira { transform: scale(0.55); }
.la-espira { opacity: 0; }
.la-cristal[data-on="true"] .la-respira { animation: la-respira 10s ease-in-out infinite; }
.la-cristal[data-on="true"] .la-inspira { animation: la-inspira 10s linear infinite; }
.la-cristal[data-on="true"] .la-espira { animation: la-espira 10s linear infinite; }
@keyframes la-respira { 0% { transform: scale(0.55); } 40% { transform: scale(1); } 100% { transform: scale(0.55); } }
@keyframes la-inspira { 0%, 37% { opacity: 1; } 42%, 97% { opacity: 0; } 100% { opacity: 1; } }
@keyframes la-espira { 0%, 37% { opacity: 0; } 42%, 95% { opacity: 1; } 100% { opacity: 0; } }
@keyframes la-suma { 0% { opacity: 0; transform: translateY(0.4em); } 20% { opacity: 1; } 70% { opacity: 1; } 100% { opacity: 0; transform: translateY(-1.2em); } }
@media (prefers-reduced-motion: reduce) {
  .la-vaiven, .la-flota, .la-brillo, [data-pulsa="true"], .la-suma[data-on="true"], .la-cristal[data-on="true"] .la-respira, .la-cristal[data-on="true"] .la-inspira, .la-cristal[data-on="true"] .la-espira { animation: none; }
  .la-respira { transform: scale(0.8); }
  .la-cristal, .la-giro, .la-sube, .la-barra, .la-vidrio::after, .la-regla-hecho, .la-regla-punto { transition: none !important; }
}
`;
