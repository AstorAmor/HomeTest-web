"use client";

import { useEffect, useRef } from "react";

// Fondo de la portada del pre-lanzamiento: una tela de seda en Deep Green que ondula despacio,
// con brillos sage y gold en las crestas. Un único shader WebGL, sin librerías. Sin WebGL se ve el
// color de fondo del contenedor; con "reducir movimiento" se pinta un solo fotograma, quieto.

const VERTEX = "attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }";

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;
uniform float u_time;

// Altura de la tela: ondas largas deformadas por otras ondas (pliegues de seda).
float h(vec2 p, float t) {
  float v = 0.55 * sin(p.x * 1.10 + t * 0.70 + 1.70 * sin(p.y * 0.80 - t * 0.40));
  v += 0.30 * sin(p.x * 1.90 - p.y * 1.30 + t * 0.50 + 0.90 * sin(p.x * 0.60 + t * 0.30));
  v += 0.15 * sin(p.y * 2.70 + p.x * 0.50 - t * 0.60);
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y) * 3.6;
  p = mat2(0.82, -0.57, 0.57, 0.82) * p;

  float e = 0.004;
  float c = h(p, u_time);
  vec2 g = vec2(h(p + vec2(e, 0.0), u_time) - c, h(p + vec2(0.0, e), u_time) - c) / e;
  vec3 n = normalize(vec3(-g * 0.7, 1.0));
  vec3 l = normalize(vec3(-0.45, 0.55, 0.70));
  float diff = clamp(dot(n, l), 0.0, 1.0);
  float spec = pow(clamp(dot(n, normalize(l + vec3(0.0, 0.0, 1.0))), 0.0, 1.0), 90.0);

  vec3 deep = vec3(0.025, 0.090, 0.078);
  vec3 green = vec3(0.055, 0.165, 0.141);  // #0E2A24
  vec3 lift = vec3(0.150, 0.330, 0.275);
  vec3 sage = vec3(0.560, 0.660, 0.600);
  vec3 gold = vec3(0.788, 0.639, 0.420);   // #C9A36B

  vec3 col = mix(deep, green, smoothstep(0.2, 0.8, diff));
  col = mix(col, lift, pow(diff, 8.0) * 0.9);
  col += spec * mix(sage, gold, 0.6) * 0.75;

  float vignette = smoothstep(1.25, 0.25, length((uv - 0.5) * vec2(1.3, 1.0)));
  col *= mix(0.6, 1.0, vignette);
  // Grano mínimo para que los degradados oscuros no hagan bandas
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

export default function SilkBackground() {
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

    // Un triángulo que cubre toda la pantalla
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");

    const draw = (seconds: number) => {
      gl.uniform1f(uTime, seconds * 0.18);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Resolución algo reducida: la seda es suave y así va fluido también en móviles
    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      if (still) draw(40);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    let frame = 0;
    const start = performance.now();
    if (!still) {
      const loop = (now: number) => {
        draw(40 + (now - start) / 1000);
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
    }
    canvas.style.opacity = "1";

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
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
