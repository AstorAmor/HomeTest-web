"use client";

import { useEffect, useRef } from "react";

// Fondo de la lista de espera: las "capas" de la marca (las mismas láminas que las imágenes de
// scripts/capas/ y el medallón de Tu edad KUOVA) pero vivas: el relieve de ruido se desplaza muy
// despacio y los bordes de las láminas cambian de forma. Las láminas cruzan en diagonal, como arcos
// de un círculo muy grande, y suben hacia arriba a la derecha. Un único shader WebGL, sin librerías;
// solo se anima mientras está a la vista y con "reducir movimiento" se pinta un fotograma quieto.

const VERTEX = "attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }";

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;
uniform float u_time;

const float N = 5.0;
const vec3 BG = vec3(0.031, 0.094, 0.078);   // #081814
const vec3 TOP = vec3(0.118, 0.302, 0.255);  // #1E4D41
const vec3 GOLD = vec3(0.788, 0.639, 0.420); // #C9A36B

vec2 grad(vec2 i) {
  float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453) * 6.2831853;
  return vec2(cos(a), sin(a));
}
float noise(vec2 p) {
  vec2 i = floor(p), f = p - i;
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(grad(i), f);
  float b = dot(grad(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(grad(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(grad(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) { return (noise(p) + 0.5 * noise(p * 2.0 + vec2(17.0, 9.0))) / 1.5; }

// Las láminas son arcos de un círculo enorme con el centro muy fuera del lienzo, abajo a la
// izquierda: cruzan en diagonal y suben hacia arriba a la derecha, sin que se vea nunca el círculo.
const vec2 CENTRO = vec2(-3.2, -2.8);

// Altura en "niveles" (0..N) del punto fc, en píxeles del lienzo
float relieve(vec2 fc) {
  float m = min(u_res.x, u_res.y);
  vec2 c = (fc - 0.5 * u_res) / m;
  vec2 esquina = 0.5 * u_res / m;
  // Distancias al centro de la esquina más cercana y de la más lejana: así se ven todas las
  // láminas tanto en un lienzo ancho como en uno alto (móvil)
  float cerca = length(-esquina - CENTRO), lejos = length(esquina - CENTRO);
  vec2 deriva = vec2(u_time * 0.021, -u_time * 0.013);
  float f = 0.5 + fbm(c * 1.25 + vec2(4.3, 2.1) + deriva) * 1.1;
  float tramo = lejos - cerca;
  float base = clamp((length(c - CENTRO) + 0.04 * sin(u_time * 0.25) - cerca + 0.12 * tramo) / (1.2 * tramo), 0.0, 1.0);
  // Menos ruido que en las imágenes fijas (0,24): así manda la diagonal y no salen manchas
  return clamp((0.11 * f + 0.97 * base) * N, 0.0, N - 0.001);
}

vec3 tono(float l) { return mix(BG, TOP, pow(l / (N - 1.0), 0.9)); }

void main() {
  vec2 fc = gl_FragCoord.xy;
  float px = max(1.0, min(u_res.x, u_res.y) / 900.0);
  float t = relieve(fc);
  float L = floor(t), fr = t - L;
  float g = max(1e-4, length(vec2(relieve(fc + vec2(1.0, 0.0)) - t, relieve(fc + vec2(0.0, 1.0)) - t)));
  float borde = fr / g;
  vec3 col = L > 0.0 ? mix(tono(L - 1.0), tono(L), clamp(borde, 0.0, 1.0)) : tono(0.0);

  // Sombra suave de la lámina de arriba a la izquierda
  float S = 9.0 * px, sh = 0.0;
  for (int k = 1; k <= 9; k++) {
    float d = float(k) * S / 9.0;
    if (floor(relieve(fc + vec2(-d, d))) > L) { sh = 1.0 - d / S; break; }
  }
  col *= 1.0 - sh * 0.32;

  // Hilo dorado finísimo en el borde de la lámina más alta
  if (L >= N - 1.0) col = mix(col, GOLD, (1.0 - smoothstep(0.4 * px, 1.4 * px, borde)) * 0.7);

  // Grano mínimo para que los degradados oscuros no hagan bandas
  col += (fract(sin(dot(fc, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

export default function CapasVivas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!canvas || !gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // Un triángulo que cubre todo el lienzo
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let segundos = 0;
    const draw = () => {
      gl.uniform1f(uTime, segundos);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    // El movimiento es lento: con unos 30 fotogramas por segundo basta y el móvil lo agradece.
    // Fuera de la vista no se dibuja; al volver sigue donde estaba.
    let frame = 0;
    let visible = false;
    let anterior = 0;
    const loop = (now: number) => {
      if (now - anterior >= 32) {
        segundos += Math.min(0.1, (now - (anterior || now)) / 1000);
        anterior = now;
        draw();
      }
      frame = requestAnimationFrame(loop);
    };
    const vista = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      anterior = 0;
      if (visible && !still) frame = requestAnimationFrame(loop);
    });
    vista.observe(canvas);
    canvas.style.opacity = "1";

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      vista.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-[1500ms]"
    />
  );
}
