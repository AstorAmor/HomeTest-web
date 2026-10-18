"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

// Editor de textos de la web (/editar, solo en el ordenador): enseña cada texto de los archivos
// JSON de content/ como una caja con su nombre en castellano y, al lado, la web en vivo. Al guardar
// se reescribe el archivo y la vista se actualiza sola. Guía: content/README.md.

type Json = string | number | boolean | null | Json[] | { [clave: string]: Json };
type Ruta = (string | number)[];
type Archivo = { id: string; nombre: string; vista: string | null };
type Objeto = { [clave: string]: Json };

// Secciones principales: título en el editor y a qué parte de la web salta la vista previa
const SECCIONES: Record<string, { titulo: string; ancla?: string }> = {
  hero: { titulo: "Portada (lo primero que se ve)", ancla: "" },
  intro: { titulo: "Frase grande bajo la portada", ancla: "intro" },
  pasos_intro: { titulo: "«Cómo funciona»: título", ancla: "como-funciona" },
  pasos: { titulo: "Los siete pasos", ancla: "como-funciona" },
  edad: { titulo: "Tu edad KUOVA (medallón)", ancla: "edad-kuova" },
  datos: { titulo: "Privacidad", ancla: "privacidad" },
  preguntas: { titulo: "Preguntas frecuentes", ancla: "preguntas" },
  lista: { titulo: "Lista de espera (al final)", ancla: "lista-de-espera" },
  marca: { titulo: "Marca" },
  nav: { titulo: "Menú de arriba", ancla: "" },
  seo: { titulo: "Títulos y descripciones para Google y redes" },
  home: { titulo: "Página /como-funciona y resumen para buscadores con IA" },
  footer: { titulo: "Pie de página", ancla: "lista-de-espera" },
  pagina_como_funciona: { titulo: "Página /como-funciona" },
  pagina_catalogo: { titulo: "Página /catalogo" },
  pagina_faq: { titulo: "Página /faq" },
  pagina_contacto: { titulo: "Página /contacto" },
  ui: { titulo: "Textos pequeños (botones, formularios, menú del móvil)" },
};

const ETIQUETAS: Record<string, string> = {
  eyebrow: "Texto pequeño encima del título",
  titulo: "Título",
  titulo_2: "Título, segunda línea (en cursiva)",
  subtitulo: "Subtítulo",
  texto: "Texto",
  destacado: "Parte destacada (en cursiva dorada)",
  cta: "Botón (vacío = sin botón)",
  cta_2: "Segundo botón",
  imagen: "Foto",
  imagen_alt: "Descripción de la foto (para personas ciegas y para Google)",
  video: "Vídeo (vacío = solo la foto)",
  video_bucle: "Vídeo en bucle después del primero (vacío = el primero se repite)",
  encuadre: "Encuadre de la foto",
  senales_titulo: "Título de la tarjeta de señales",
  senales: "Señales que van rotando",
  fuente: "De dónde viene",
  paso: "Palabra «Paso»",
  etiqueta: "Nombre corto del paso",
  puntos: "Puntos con ✓",
  proximamente: "Frase de «muy pronto» (vacío = no sale)",
  escena: "Animación sobre la foto (los datos son un ejemplo)",
  lado: "Lado de la tarjeta animada (en ordenador)",
  pregunta: "Pregunta",
  respuesta: "Respuesta",
  opciones: "Opciones",
  elegida: "Opción que se marca (0 = la primera)",
  objetivos_titulo: "Título de los objetivos",
  objetivos: "Objetivos",
  estado: "Estado",
  anillo_titulo: "Nombre del anillo",
  lecturas: "Lecturas (una distinta en cada vuelta)",
  valor: "Valor",
  nota: "Nota",
  sueno: "Sueño",
  pulso: "Pulso en reposo",
  vfc: "Variabilidad cardiaca",
  hora: "Hora",
  energia: "Energía",
  animo: "Ánimo",
  digestion: "Digestión",
  digestion_opciones: "Opciones de digestión",
  presion: "Presión arterial (nombre)",
  presion_unidad: "Unidad de la presión",
  sistolica: "Nombre de la línea alta (sistólica)",
  diastolica: "Nombre de la línea baja (diastólica)",
  presion_sistolica: "Sistólica de cada día (números; el último es «hoy»)",
  presion_diastolica: "Diastólica de cada día (números; el último es «hoy»)",
  ciclo_fase: "Fase del ciclo",
  ciclo_dia: "Día del ciclo (número, para colocar la marca)",
  ciclo_duracion: "Duración del ciclo en días",
  ciclo_valor: "Día del ciclo (texto)",
  ciclo_nota: "Frase de la fase",
  procesando: "Texto mientras analiza",
  sistemas: "Sistemas que se analizan",
  listo: "Texto al terminar",
  ejemplo: "Etiqueta «Ejemplo»",
  marcador: "Marcador",
  unidad: "Unidad",
  zonas: "Zonas del rango",
  relacion_titulo: "Título de las relaciones",
  relaciones: "Relaciones",
  acciones: "Acciones del plan",
  proyeccion: "Título de la proyección",
  valores: "Valor en cada análisis",
  rango: "Nombre de la banda óptima",
  hitos: "Nombre de cada análisis",
  lista: "Preguntas",
  titulo_medallon: "Texto encima del medallón",
  edad_real: "Edad real del ejemplo (número)",
  edad_kuova: "Edad KUOVA del ejemplo (número, con punto: 34.2)",
  diferencia: "Diferencia (texto bajo el medallón)",
  edad_real_texto: "Edad real (texto)",
  email: "Email",
  placeholder: "Texto gris dentro de la casilla",
  boton: "Botón",
  enviando: "Botón mientras se envía",
  exito_titulo: "Mensaje al apuntarse (título)",
  exito_texto: "Mensaje al apuntarse (texto)",
  error: "Mensaje si algo falla",
  privacidad: "Enlace a la política de privacidad",
  nombre: "Nombre",
  descripcion_corta: "Descripción corta",
  descripcion: "Descripción",
  enlaces: "Enlaces",
  label: "Texto del enlace",
  href: "Dirección del enlace",
  title: "Título en Google",
  description: "Descripción en Google",
  parrafo: "Párrafo",
  clave: "Dato",
  columnas: "Columnas",
  redes: "Redes sociales",
  texto_copyright: "Texto de copyright",
  nota_legal: "Nota legal",
  titulo_hero: "Título de la página",
  subtitulo_hero: "Subtítulo de la página",
  lema: "Lema",
  grafica_rango: "Nombre de la banda óptima de la gráfica",
  grafica: "Marcadores de la gráfica",
  detalle: "Detalle",
  titulo_formulario: "Título del formulario",
  placeholder_email: "Texto gris dentro de la casilla del email",
  boton_enviando: "Botón mientras se envía",
  nota_privacidad: "Nota de privacidad",
  enlace_privacidad: "Enlace a privacidad",
  pie_privacidad: "Pie: privacidad",
  pie_condiciones: "Pie: condiciones",
};

// Pistas bajo algunas cajas
const AYUDAS: Record<string, string> = {
  imagen: "Archivo dentro de public/images/inicio/. Si cambias una foto, ponle un nombre nuevo.",
  video: "Archivo dentro de public/videos/inicio/. Vacío = se ve la foto con un zoom lento. En la portada, el móvil usa el mismo nombre acabado en -movil.mp4.",
  video_bucle: "Archivo dentro de public/videos/inicio/; el móvil usa el mismo nombre acabado en -movil.mp4.",
  encuadre: "Qué parte de la foto se ve: horizontal y vertical, p. ej. «70% 40%» (0% = izquierda/arriba).",
  lado: "En el móvil la tarjeta va siempre debajo de la foto.",
  titulo_2: "Sale en otra línea, en cursiva dorada.",
};

// Lo que no se cambia desde aquí (identifica el paso o el tipo de animación)
const SOLO_LECTURA = new Set(["id", "tipo"]);
const DESPLEGABLES: Record<string, string[]> = { lado: ["izquierda", "derecha", "centro"] };
// Cajas grandes aunque el texto sea corto
const LARGOS = new Set(["texto", "subtitulo", "respuesta", "parrafo", "descripcion", "description", "nota", "nota_legal"]);

const humano = (clave: string) => (clave.charAt(0).toUpperCase() + clave.slice(1)).replace(/_/g, " ");
const etiqueta = (clave: string) => ETIQUETAS[clave] ?? humano(clave);

function poner(raiz: Json, ruta: Ruta, valor: Json): Json {
  if (!ruta.length) return valor;
  const [k, ...resto] = ruta;
  if (Array.isArray(raiz)) {
    const copia = raiz.slice();
    copia[k as number] = poner(raiz[k as number], resto, valor);
    return copia;
  }
  const obj = raiz as Objeto;
  return { ...obj, [k]: poner(obj[k as string], resto, valor) };
}

const esObjeto = (v: Json): v is Objeto => typeof v === "object" && v !== null && !Array.isArray(v);

// Copia de un elemento con los textos vacíos, para "Añadir otro"
function vaciar(v: Json): Json {
  if (typeof v === "string") return "";
  if (Array.isArray(v)) return v.map(vaciar);
  if (esObjeto(v)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, SOLO_LECTURA.has(k) ? x : vaciar(x)]));
  return v;
}

const Ctx = createContext<{ cambiar: (ruta: Ruta, valor: Json) => void; irA: (ancla: string) => void }>({
  cambiar: () => {},
  irA: () => {},
});

const caja =
  "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-[15px] text-text shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

function Campo({ clave, valor, ruta }: { clave: string; valor: Json; ruta: Ruta }) {
  const { cambiar } = useContext(Ctx);
  const id = ruta.join(".");

  if (SOLO_LECTURA.has(clave)) {
    return (
      <p className="text-xs text-text-muted">
        {clave}: <code className="font-mono">{String(valor)}</code> (no se cambia)
      </p>
    );
  }

  let control: React.ReactNode;
  if (DESPLEGABLES[clave] && typeof valor === "string") {
    control = (
      <select id={id} className={caja} value={valor} onChange={(e) => cambiar(ruta, e.target.value)}>
        {DESPLEGABLES[clave].map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    );
  } else if (typeof valor === "number") {
    control = (
      <input id={id} type="number" className={`${caja} max-w-40`} value={valor} onChange={(e) => cambiar(ruta, e.target.value === "" ? 0 : Number(e.target.value))} />
    );
  } else if (typeof valor === "boolean") {
    control = <input id={id} type="checkbox" checked={valor} onChange={(e) => cambiar(ruta, e.target.checked)} />;
  } else {
    const texto = valor ?? "";
    const largo = LARGOS.has(clave) || String(texto).length > 70;
    const alCambiar = (v: string) => cambiar(ruta, valor === null && v === "" ? null : v);
    control = largo ? (
      <textarea id={id} className={caja} rows={Math.min(8, Math.ceil(String(texto).length / 60) + 1)} value={String(texto)} onChange={(e) => alCambiar(e.target.value)} />
    ) : (
      <input id={id} className={caja} value={String(texto)} placeholder={valor === null ? "(vacío)" : undefined} onChange={(e) => alCambiar(e.target.value)} />
    );
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-3 text-sm font-semibold text-text">
        {etiqueta(clave)}
        <code className="font-mono text-[11px] font-normal text-text-muted/70">{clave}</code>
      </label>
      {control}
      {AYUDAS[clave] && <p className="mt-1 text-xs text-text-muted">{AYUDAS[clave]}</p>}
    </div>
  );
}

const limpiar = (texto: string) => texto.split("\n").map((l) => l.trim()).filter(Boolean);

// Lista de textos: una caja con un texto por línea (las líneas vacías no cuentan)
function ListaTextos({ clave, valor, ruta }: { clave: string; valor: string[]; ruta: Ruta }) {
  const { cambiar } = useContext(Ctx);
  const id = ruta.join(".");
  const [texto, setTexto] = useState(valor.join("\n"));
  // Si la lista cambia desde fuera (descartar cambios, otro archivo), la caja se pone al día
  useEffect(() => {
    setTexto((t) => (limpiar(t).join("\n") === valor.join("\n") ? t : valor.join("\n")));
  }, [valor]);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-3 text-sm font-semibold text-text">
        {etiqueta(clave)} <span className="font-normal text-text-muted">(uno por línea)</span>
        <code className="ml-auto font-mono text-[11px] font-normal text-text-muted/70">{clave}</code>
      </label>
      <textarea
        id={id}
        className={caja}
        rows={Math.max(2, valor.length + 1)}
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          cambiar(ruta, limpiar(e.target.value));
        }}
      />
    </div>
  );
}

// Lista de números (valores de una gráfica): separados por comas
function ListaNumeros({ clave, valor, ruta }: { clave: string; valor: number[]; ruta: Ruta }) {
  const { cambiar } = useContext(Ctx);
  const [texto, setTexto] = useState(valor.join(", "));
  useEffect(() => {
    setTexto((t) => (t.split(",").map((x) => Number(x.trim())).join(",") === valor.join(",") ? t : valor.join(", ")));
  }, [valor]);
  return (
    <div>
      <label className="mb-1.5 flex items-baseline justify-between gap-3 text-sm font-semibold text-text">
        {etiqueta(clave)} <span className="font-normal text-text-muted">(separados por comas)</span>
        <code className="ml-auto font-mono text-[11px] font-normal text-text-muted/70">{clave}</code>
      </label>
      <input
        className={caja}
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          const nums = e.target.value.split(",").map((x) => Number(x.trim().replace(",", ".")));
          if (nums.length && nums.every((n) => !Number.isNaN(n))) cambiar(ruta, nums);
        }}
      />
    </div>
  );
}

function tituloElemento(item: Json, i: number, clave: string) {
  if (!esObjeto(item)) return `${i + 1}`;
  if (clave === "pasos") return `Paso ${i + 1} · ${item.etiqueta ?? ""}`;
  const t = item.titulo ?? item.pregunta ?? item.texto ?? item.label ?? item.marcador ?? item.nombre ?? item.clave ?? item.valor;
  return `${i + 1}. ${typeof t === "string" || typeof t === "number" ? String(t).slice(0, 70) : ""}`;
}

function Nodo({ clave, valor, ruta }: { clave: string; valor: Json; ruta: Ruta }) {
  const { cambiar, irA } = useContext(Ctx);

  if (Array.isArray(valor)) {
    if (valor.every((v) => typeof v === "string")) return <ListaTextos clave={clave} valor={valor as string[]} ruta={ruta} />;
    if (valor.every((v) => typeof v === "number")) return <ListaNumeros clave={clave} valor={valor as number[]} ruta={ruta} />;
    return (
      <div>
        <p className="mb-2 text-sm font-semibold text-text">{etiqueta(clave)}</p>
        <div className="space-y-2">
          {valor.map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-border bg-bg-soft/40 open:bg-white"
              onToggle={(e) => {
                if (e.target === e.currentTarget && e.currentTarget.open && esObjeto(item) && typeof item.id === "string") irA(item.id);
              }}
            >
              <summary className="cursor-pointer select-none px-4 py-3 text-[15px] font-medium text-text">{tituloElemento(item, i, clave)}</summary>
              <div className="space-y-4 border-t border-border px-4 py-4">
                <Nodo clave={clave} valor={item} ruta={[...ruta, i]} />
                <button
                  type="button"
                  className="text-xs font-medium text-red-700 hover:underline"
                  onClick={() => {
                    if (confirm("¿Quitar este elemento? (no se borra nada hasta que pulses Guardar)")) cambiar(ruta, valor.filter((_, j) => j !== i));
                  }}
                >
                  Quitar este
                </button>
              </div>
            </details>
          ))}
        </div>
        {valor.length > 0 && (
          <button type="button" className="mt-2 text-sm font-medium text-accent-light hover:underline" onClick={() => cambiar(ruta, [...valor, vaciar(valor[valor.length - 1])])}>
            + Añadir otro
          </button>
        )}
      </div>
    );
  }

  if (esObjeto(valor)) {
    const entradas = Object.entries(valor).filter(([k]) => !k.startsWith("_"));
    const anidado = ruta.length > 1 && typeof ruta[ruta.length - 1] === "string";
    const contenido = (
      <div className="space-y-4">
        {entradas.map(([k, v]) => (
          <Nodo key={k} clave={k} valor={v} ruta={[...ruta, k]} />
        ))}
      </div>
    );
    // Un objeto dentro de otro (por ejemplo, la animación de un paso) va en un recuadro con título
    return anidado ? (
      <fieldset className="rounded-2xl border border-dashed border-accent/25 p-4">
        <legend className="px-1.5 text-sm font-semibold text-accent-light">{etiqueta(clave)}</legend>
        {contenido}
      </fieldset>
    ) : (
      contenido
    );
  }

  return <Campo clave={clave} valor={valor} ruta={ruta} />;
}

export default function EditorTextos({ archivos }: { archivos: Archivo[] }) {
  const [archivoId, setArchivoId] = useState(archivos[0].id);
  const [datos, setDatos] = useState<Json | null>(null);
  const [original, setOriginal] = useState("");
  const [estado, setEstado] = useState<"cargando" | "listo" | "guardando" | "guardado" | "error">("cargando");
  const [ancla, setAncla] = useState("");
  const [recarga, setRecarga] = useState(0);

  const archivo = archivos.find((a) => a.id === archivoId) ?? archivos[0];
  const hayCambios = datos !== null && JSON.stringify(datos) !== original;

  const cargar = useCallback(async (id: string) => {
    setEstado("cargando");
    const res = await fetch(`/api/editar?archivo=${id}`);
    const { datos: d } = await res.json();
    setDatos(d);
    setOriginal(JSON.stringify(d));
    setEstado("listo");
  }, []);

  useEffect(() => {
    cargar(archivoId);
  }, [archivoId, cargar]);

  const guardar = useCallback(async () => {
    if (!hayCambios || datos === null) return;
    setEstado("guardando");
    const res = await fetch("/api/editar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archivo: archivoId, datos }),
    });
    if (res.ok) {
      setOriginal(JSON.stringify(datos));
      setEstado("guardado");
    } else {
      setEstado("error");
    }
  }, [archivoId, datos, hayCambios]);

  // Ctrl+S (o Cmd+S) guarda
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        guardar();
      }
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [guardar]);

  // Aviso al cerrar la pestaña con cambios sin guardar
  useEffect(() => {
    if (!hayCambios) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [hayCambios]);

  const cambiar = useCallback((ruta: Ruta, valor: Json) => {
    setDatos((d) => (d === null ? d : poner(d, ruta, valor)));
    setEstado("listo");
  }, []);

  const estadoTexto = {
    cargando: "Cargando…",
    listo: hayCambios ? "Cambios sin guardar" : "Sin cambios",
    guardando: "Guardando…",
    guardado: "Guardado ✓ (solo en tu ordenador)",
    error: "No se ha podido guardar",
  }[estado];

  return (
    <Ctx.Provider value={{ cambiar, irA: setAncla }}>
      <div className="fixed inset-0 z-[100] flex flex-col bg-bg text-text">
        <header className="flex flex-wrap items-center gap-3 border-b border-border bg-bg px-5 py-3">
          <p className="font-display text-xl">Editor de textos</p>
          <select
            className="rounded-full border border-border bg-white px-4 py-2 text-sm"
            value={archivoId}
            onChange={(e) => {
              if (hayCambios && !confirm("Tienes cambios sin guardar. ¿Cambiar de archivo y perderlos?")) return;
              setAncla("");
              setArchivoId(e.target.value);
            }}
          >
            {archivos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
          <span className={`ml-auto text-sm ${hayCambios ? "font-semibold text-accent-light" : "text-text-muted"}`}>{estadoTexto}</span>
          <button
            type="button"
            disabled={!hayCambios}
            onClick={() => cargar(archivoId)}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            Descartar cambios
          </button>
          <button
            type="button"
            disabled={!hayCambios}
            onClick={guardar}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-on-accent disabled:opacity-40"
          >
            Guardar <span className="font-normal opacity-70">(Ctrl+S)</span>
          </button>
        </header>

        <div className="flex min-h-0 flex-1">
          <div className="w-full overflow-y-auto px-5 py-6 lg:w-[46%] lg:border-r lg:border-border">
            <div className="mb-6 rounded-2xl bg-gold/10 p-4 text-sm leading-relaxed text-text">
              Cambia lo que quieras y pulsa <strong>Guardar</strong>: la web de la derecha se actualiza sola. Todo se queda en tu
              ordenador; para publicarlo hay que subirlo a GitHub (guía en <code>content/README.md</code>). Si cambias un texto en
              español, cámbialo también en inglés. Las cifras de las animaciones son ejemplos.
            </div>

            {datos !== null && esObjeto(datos) && (
              <div className="space-y-3">
                {Object.entries(datos)
                  .filter(([k]) => !k.startsWith("_"))
                  .map(([k, v]) =>
                    esObjeto(v) || Array.isArray(v) ? (
                      <details
                        key={`${archivoId}-${k}`}
                        className="rounded-3xl border border-border bg-white/60 open:bg-white"
                        onToggle={(e) => {
                          // Solo cuando se abre esta sección (no un paso de dentro)
                          const sec = SECCIONES[k];
                          if (e.target === e.currentTarget && e.currentTarget.open && sec?.ancla !== undefined) setAncla(sec.ancla);
                        }}
                      >
                        <summary className="cursor-pointer select-none px-5 py-4 font-display text-lg">{SECCIONES[k]?.titulo ?? humano(k)}</summary>
                        <div className="space-y-4 border-t border-border px-5 py-5">
                          <Nodo clave={k} valor={v} ruta={[k]} />
                        </div>
                      </details>
                    ) : (
                      <div key={`${archivoId}-${k}`} className="rounded-2xl bg-white/60 px-5 py-4">
                        <Nodo clave={k} valor={v} ruta={[k]} />
                      </div>
                    ),
                  )}
              </div>
            )}
          </div>

          {archivo.vista ? (
            <div className="hidden flex-1 flex-col lg:flex">
              <div className="flex items-center gap-4 border-b border-border px-4 py-2 text-xs text-text-muted">
                Vista previa (se actualiza al guardar)
                <button type="button" className="underline" onClick={() => setRecarga((r) => r + 1)}>
                  Recargar
                </button>
                <a className="underline" href={`${archivo.vista}#${ancla}`} target="_blank" rel="noreferrer">
                  Abrir en otra pestaña
                </a>
              </div>
              <iframe key={`${archivo.vista}-${recarga}`} title="Vista previa de la web" src={`${archivo.vista}#${ancla}`} className="w-full flex-1 bg-white" />
            </div>
          ) : (
            <div className="hidden flex-1 items-center justify-center p-10 text-center text-sm text-text-muted lg:flex">
              Esta página no se puede ver aquí: el editor arranca la web completa. Para verla, usa el servidor de pre-lanzamiento o
              mírala en kuovahealth.com después de publicar.
            </div>
          )}
        </div>
      </div>
    </Ctx.Provider>
  );
}
