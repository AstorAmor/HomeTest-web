# Cómo editar los textos de la web

Todos los textos de kuovahealth.com están en esta carpeta (`content/`), separados del código. Hay dos formas de cambiarlos, y ninguna gasta créditos de Claude.

## 1. La forma fácil: el editor

1. En la carpeta `HomeTest-web`, haz doble clic en **`Editar textos web.bat`**. Se abre una ventana negra (déjala abierta) y, a los pocos segundos, el navegador con el editor en http://localhost:3010/editar. La primera vez puede tardar medio minuto.
2. Arriba eliges qué quieres cambiar: **Portada (español)**, **Portada (inglés)**, **Menú, pie de página y Google**, o la **página de pre-lanzamiento** (la que se ve hoy en kuovahealth.com).
3. Abre una sección (por ejemplo «Los siete pasos» → «Paso 3 · Registra»): la web de la derecha salta a esa parte. Cambia el texto y pulsa **Guardar** (o Ctrl+S). La web de la derecha se actualiza sola.
4. Cuando termines, cierra la ventana negra.

Nada de esto se publica: los cambios se quedan en tu ordenador hasta que los subas (punto 3).

Trucos:
- **Listas** (los puntos con ✓, opciones, objetivos…): un elemento por línea.
- **Vacío = no sale**: por ejemplo, si borras el «Botón» de un paso, ese paso se queda sin botón; si escribes algo, aparece.
- **Añadir otro** copia el último elemento de la lista con los textos vacíos (útil para añadir una pregunta frecuente). **Quitar este** lo elimina. Nada se borra de verdad hasta que pulsas Guardar, y **Descartar cambios** vuelve a lo último guardado.
- Lo que pone «no se cambia» (`id`, `tipo`) identifica cada paso y su animación: no hace falta tocarlo.
- Si cambias un texto en español, cámbialo también en **Portada (inglés)**.
- Las cifras de las animaciones (ferritina 18 → 52, preparación 82…) son **ejemplos ilustrativos**, no datos reales.

## 2. Editar los archivos a mano

También puedes abrir los archivos con el Bloc de notas o VS Code, o editarlos directamente en github.com (botón del lápiz → «Commit changes»; eso publica directamente).

| Archivo | Qué contiene |
|---|---|
| `inicio.json` | Portada completa en español |
| `en/inicio.json` | La misma portada en inglés |
| `site-copy.json` (y `en/`) | Menú de arriba, pie de página, títulos para Google, otras páginas, textos pequeños |
| `prelaunch.json` | Página de pre-lanzamiento (la que se ve hoy en kuovahealth.com) |
| `faq.json` (y `en/`) | Preguntas de la página /faq (las de la portada están en `inicio.json` → `preguntas`) |
| `legal.ts` | Política de privacidad y condiciones |

Reglas para no romper nada al editar a mano: cambia solo lo que va entre comillas a la derecha de los dos puntos, deja las comillas y las comas, no pongas saltos de línea dentro de un texto y, si necesitas comillas dentro de un texto, usa « » o ’.

`inicio.json`, en el mismo orden en que se ve la página:
- `hero`: lo primero que se ve (texto pequeño, título en dos líneas, subtítulo, botones, foto, vídeo y la tarjeta de «señales» que van rotando).
- `intro`: la frase grande bajo la portada.
- `pasos_intro`: el título de «Cómo funciona».
- `pasos`: los siete pasos. Cada uno tiene `etiqueta` (Cuéntanos, Conecta…), `titulo`, `texto`, `puntos`, `cta` (botón; `null` = sin botón), la foto (`imagen`, `imagen_alt`, `encuadre`) y `escena`, los textos de la animación de cristal que va sobre la foto.
- `edad`: Tu edad KUOVA, con el medallón de la app y cifras de ejemplo (`edad_real`, `edad_kuova` con punto decimal, y los textos que salen debajo). La imagen es la de la app (`hometest-app/assets/images/kuova-age/light_good.jpg`); si allí cambia, cópiala a `public/images/inicio/` con otro nombre y cambia `imagen`.
- `datos`: privacidad. `preguntas`: preguntas frecuentes. `lista`: la lista de espera del final.

## 3. Publicar los cambios

Los textos viven en GitHub (repositorio `AstorAmor/HomeTest-web`). Cuando un cambio llega a la rama `master`, Vercel publica kuovahealth.com sola en 1–2 minutos.

- **Con GitHub Desktop**: abre el repositorio HomeTest-web, verás los archivos cambiados; escribe un resumen abajo a la izquierda → «Commit to master» → «Push origin».
- **Ojo**: mientras esté activo el pre-lanzamiento (`lib/launch.ts`), kuovahealth.com solo enseña la página de pre-lanzamiento. Publicar textos de la portada completa **no la hace visible**: para eso hay que poner `NEXT_PUBLIC_PRELAUNCH=false` en Vercel y volver a publicar. Los cambios en `prelaunch.json`, en cambio, sí se ven en cuanto se publican.

## Fotos y vídeos de la portada

- Fotos: `public/images/inicio/`. Para cambiar una, copia la nueva con **otro nombre** (si reutilizas el nombre, el navegador puede seguir enseñando la antigua) y pon la nueva ruta en `imagen`.
- `encuadre`: qué parte de la foto se ve, en horizontal y vertical («70% 40%»; 0% = izquierda/arriba).
- `lado` (dentro de `escena`): a qué lado va la tarjeta animada en el ordenador (`izquierda`, `derecha` o `centro`), siempre al contrario de la persona. En el móvil va debajo de la foto.
- Vídeo de fondo de la portada (`public/videos/inicio/`), desde el 27/10/2026: `hero.video` = `portada-carrusel.mp4`, un carrusel de primeros planos con gente haciendo algo, seis clips de 3,5 s con corte seco (21 s por vuelta, se repite): corredora, vaso que se llena, bicicleta, aguas abiertas, niño en brazos y tenis. `hero.video_bucle` vacío y `hero.video_planos` = 6: la tarjeta de señales cambia en cada corte. Los clips son de MiniMax H3 (originales en OneDrive, `WEBcarrusel-vid-*`); el montaje sale de un script que recorta cada clip a 3,5 s, quita el sonido y los une (1920 de ancho, H.264 crf 28, ~5 MB). En el móvil, `portada-carrusel-movil.mp4` (606×1076, ~2 MB) es un recorte vertical 9:16 centrado en el sujeto de cada plano. Antes del vídeo y con «reducir movimiento» se ve `imagen` (`portada-carrusel.jpg`, el fotograma de partida de la corredora; en el móvil se encuadra al 64 % para que coincida con el recorte). Si cambias un vídeo, ponle otro nombre; cada vídeo va en dos archivos. `video` en `null` = solo la foto con un zoom lento; con `video_bucle`, el primer vídeo se ve una vez y se funde con el bucle. Versiones anteriores, que siguen en la carpeta: `portada-horizonte` + `portada-horizonte-bucle` (19/10 a 27/10: la chica lejos en el acantilado y la cámara gira hacia el mar), `portada-giro-2`/`portada-bucle-2` (la chica de cerca) y `portada-giro-3`/`portada-mar-2` (la chica yéndose andando).
- Fondos de «capas» (las láminas de curvas suaves detrás de la frase grande y de «Tus datos son tuyos»): `public/images/inicio/capas-*.jpg`, hechos con código, sin IA. Para regenerarlos (por ejemplo si cambia la forma de las capas de Tu edad KUOVA): `node scripts/capas/render.mjs`; tamaños, tonos y dirección en `TRABAJOS`, dentro de ese archivo. Las capas en movimiento de la lista de espera (en diagonal) no son una imagen: se dibujan en el navegador (`components/inicio/CapasVivas.tsx`).
- Originales y descartes: OneDrive → `05 Marca/Contenido IA/2026-10/` (los que empiezan por `WEB`).
- Imagen al compartir en redes (WhatsApp, LinkedIn...): `public/images/kuova-og.jpg` (1200×630), generada con `python scripts/make-og.py` desde `scripts/og/og.html`. Si la cambias, ponle otro nombre (y cámbialo en `lib/seo.ts`).

## Medición: cuánta gente entra, por dónde y quién se apunta

Sin cookies (no hace falta banner). Lo más cómodo: **kuovahealth.com/panel**, el panel privado (entras con tu cuenta de KUOVA de administración): visitantes, altas y conversión con la comparación con el periodo anterior, gráficas por día, canales, embudo, fuentes y campañas, hasta dónde baja la gente, qué pulsa, dispositivos, países, ciudades, las últimas altas y un generador de enlaces etiquetados. Los datos vienen de `web_panel` en Supabase. Debajo, las dos fuentes:

- **Vercel Web Analytics** (vercel.com → hometest-web → Analytics): visitantes, páginas, países, dispositivos y webs de origen. Hay que activarlo una vez con «Enable».
- **Nuestra medición en Supabase** (Table Editor), más detallada y unida a las altas:
  - `web_por_canal`: visitantes, altas y conversión (%) por canal (Email, Redes sociales, Redes de pago, Búsqueda orgánica, Búsqueda de pago, Asistentes IA, Mensajería, Colaboraciones, QR y offline, Enlaces de otras webs, Directo).
  - `web_por_campana`: lo mismo por fuente, medio, campaña y contenido del enlace.
  - `web_diario`: visitas, visitantes, altas y conversión por día.
  - `web_embudo`: por canal, cuántos ven «Cómo funciona», llegan a la lista, intentan apuntarse y se apuntan, y los segundos medios en la página.
  - `web_secciones` (hasta dónde baja la gente), `web_clics` (qué se pulsa), `web_audiencia` (países y dispositivos).
  - Los datos crudos: `web_visitas`, `web_eventos` y `waitlist` (cada alta con su canal, fuente, campaña, dispositivo y ciudad).
- Cómo se decide el canal: `lib/canales.ts`. Tus propias visitas no cuentan si abres una vez `kuovahealth.com/?no-contar=1` en cada navegador que uses (`?no-contar=0` lo deshace). Las visitas de prueba desde el servidor local llevan la fuente `prueba-local`.

**Enlaces con etiqueta (UTM)**: Instagram, TikTok, WhatsApp y el correo casi nunca dicen de dónde viene la visita, así que cada enlace que publiques debe llevar su etiqueta al final. Formato: `https://kuovahealth.com/?utm_source=FUENTE&utm_medium=MEDIO&utm_campaign=CAMPAÑA` (opcional `&utm_content=` para distinguir piezas). Ejemplos:

| Dónde | Enlace |
| --- | --- |
| Bio de Instagram | `https://kuovahealth.com/?utm_source=instagram&utm_medium=bio` |
| Post o reel de Instagram | `https://kuovahealth.com/?utm_source=instagram&utm_medium=reel&utm_campaign=lanzamiento&utm_content=edad-kuova` |
| Bio de TikTok | `https://kuovahealth.com/?utm_source=tiktok&utm_medium=bio` |
| LinkedIn (post) | `https://kuovahealth.com/?utm_source=linkedin&utm_medium=social&utm_campaign=lanzamiento` |
| Newsletter o email | `https://kuovahealth.com/?utm_source=newsletter&utm_medium=email&utm_campaign=octubre` |
| Firma de tu email | `https://kuovahealth.com/?utm_source=firma&utm_medium=email` |
| WhatsApp | `https://kuovahealth.com/?utm_source=whatsapp&utm_medium=mensaje` |
| QR en un folleto o evento | `https://kuovahealth.com/?utm_source=folleto&utm_medium=qr&utm_campaign=nombre-del-evento` |
| Anuncios de Meta | `https://kuovahealth.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=…` |
| Colaboración con alguien | `https://kuovahealth.com/?utm_source=nombre&utm_medium=colaboracion` |

Usa siempre minúsculas y guiones, y la misma palabra para lo mismo (si un día es `instagram` y otro `ig`, saldrán separados). Google y Bing (orgánico), ChatGPT, Perplexity y otras webs se detectan solos.

## Español e inglés

El español es el idioma principal: `/` en español y `/en` en inglés (botón «English» arriba). Nadie se redirige al inglés automáticamente. Los textos en inglés están en `content/en/`, con la misma estructura.

## Conocimiento (artículos con gráficas y fuentes)

Dirección: `/conocimiento` (índice) y `/conocimiento/<nombre-del-archivo>` (cada artículo). **Aún no sale en kuovahealth.com**: solo se ve en el servidor local (`npm run dev` → http://localhost:3000/conocimiento). Para publicarla, poner `NEXT_PUBLIC_KNOWLEDGE=true` en Vercel (Production) y volver a publicar.

- **Textos**: `conocimiento/*.md`, un archivo por artículo. Se editan como texto normal:
  - Arriba, entre las dos líneas `---`: título, subtítulo, descripción (la que sale en Google), categoría, fecha, minutos de lectura y `estado`. Con `estado: borrador` el artículo lleva un aviso y Google no lo indexa; cámbialo a `publicado` cuando esté revisado.
  - `## Título` y `### Subtítulo`; líneas que empiezan por `- ` son una lista; `**negrita**`, `*cursiva*`, `[texto](https://enlace)`.
  - `[^3]` cita la referencia 3; las referencias van al final, una por línea: `[^3]: Autor. Título. *Revista*. Año...`
  - `[[grafica:vrc]]` en una línea sola pone una gráfica. Disponibles: `individualidad`, `fuera-de-rango`, `vrc`, `tiempos`.
  - Un artículo nuevo = un archivo `.md` nuevo en esa carpeta (el nombre del archivo es la dirección, sin tildes ni espacios).
- **Números de las gráficas**: `conocimiento/datos.json` (variación biológica de cada marcador, vidas medias, datos del ejemplo). Las gráficas se recalculan solas.

## Guías, biomarcadores y comparativas (páginas con fuentes)

Tres secciones que **sí salen en kuovahealth.com** (no dependen de `NEXT_PUBLIC_KNOWLEDGE`), solo en español. Su índice común es **`/aprende`** (enlazado desde el menú y el pie de página; textos en `aprende.json`, también en el editor):

- **Guías**, en la raíz de la web para que la dirección sea corta: `/longevidad`, `/salud-preventiva`, `/edad-biologica`, `/analisis-de-sangre`, `/ciclo-menstrual`, `/alimentacion` y `/ejercicio`, en `guias/*.md`. Una guía nueva = un archivo nuevo (el nombre es la dirección: que no coincida con una página que ya exista, como `privacy` o `biomarcadores`). Campo extra de la cabecera: `sameas`, la página de Wikipedia del tema (ayuda a Google y a los asistentes de IA a saber de qué trata). Las fichas de biomarcadores que enlaza una guía muestran solas un enlace de vuelta a ella.
- **`/biomarcadores`**: una ficha por biomarcador en `biomarcadores/*.md` (hemograma, hierro y vitaminas, colesterol y lipoproteínas, glucosa y HbA1c, tiroides, inflamación…). El índice las agrupa por `categoria` y, dentro de cada una, las ordena por `orden`. El orden de las categorías está en `FAMILIAS`, en `lib/knowledge.ts`: una categoría nueva se añade ahí (si no, sale al final).
- **`/comparativas`**: Kuova frente a Apple Salud, Google Health, Oura, Garmin, Huawei Health y WHOOP, en `comparativas/*.md`.

Se escriben igual que los artículos de Conocimiento (ver arriba), con dos añadidos:
- **Tablas**: líneas que empiezan por `|`; la primera fila es la cabecera y la de guiones (`|---|---|`) se salta.
- **Preguntas frecuentes**: cada `### ¿Pregunta?` (acabada en «?») con su respuesta debajo pasa sola a los datos estructurados para Google (FAQPage) y a `/llms.txt`.
- **El primer párrafo es la respuesta corta**: es lo que leen Google y los asistentes de IA en primer lugar, lo que sale en las tarjetas de `/aprende` y en `/llms.txt`. Que responda a la pregunta del título en dos o tres frases.
- Campos de la cabecera: `revisado` (fecha en que se comprobaron las cifras con sus fuentes; sale bajo el título), `orden`, `titulo_seo` (título para Google, opcional; que empiece por lo que busca la gente) y `otros_nombres` (sinónimos y siglas, también las inglesas que imprimen los analizadores, como MCV o WBC, separados por comas). La `descripcion`, 155 caracteres como mucho, con la búsqueda principal en los primeros 120: Google corta el resto.

### Regla de cifras («escribe tu cifra»)

En algunas fichas (glucosa y HbA1c, de momento) hay una barra con los tramos de la guía y un campo «Escribe tu cifra»: la persona escribe el resultado de su informe y ve en qué tramo cae, qué significa y qué mirar a la vez. Debajo salen los mismos tramos en una tabla, que es lo que leen Google y los asistentes de IA (y lo que se ve sin JavaScript). **La cifra no sale del navegador**: no se guarda, no va a la dirección ni a la medición; lo único que se mide es que alguien usó la regla en esa ficha, sin la cifra.

Se pone escribiendo `[[regla]]` en una línea sola, donde tenga que salir (normalmente en «Cómo se interpreta», en lugar de la tabla de tramos), y los datos van en la cabecera, en un bloque `regla:` con las líneas de debajo con dos espacios delante:

```
regla:
  nombre: Glucosa en ayunas
  titulo: ¿En qué tramo cae tu glucosa en ayunas?
  unidad: mg/dL
  otra_unidad: mmol/L
  factor: 0,05551
  equivalencia: Para pasar de mg/dL a mmol/L se multiplica por 0,0555 (o se divide entre 18)[^3].
  extremos: 60 | 150
  posible: 20 | 700
  ejemplo: 92
  tramo: - | Normal | Texto del tramo, con su fuente[^1].
  tramo: 100 | Prediabetes | …
  tramo: 126 | Rango de diabetes | …
  mirar: Tu [hemoglobina glicada](/biomarcadores/hemoglobina-glicada)…
```

- `nombre`: lo que se mide, para la cabecera de la tabla. `titulo`: el título de la caja.
- `unidad`: la de los informes españoles. Si algunos informes usan otra, `otra_unidad`, con `factor` (y `suma`, si hace falta) para pasar de una a otra: otra = cifra × factor + suma. Por ejemplo, la HbA1c: `factor: 10,931` y `suma: -23,524` pasan de % a mmol/mol. `equivalencia` es la frase con la fuente que sale bajo la tabla. `decimales: 1 | 0` fija los decimales de cada unidad (si no, se deducen de los tramos).
- `tramo`: uno por línea, de menor a mayor: `desde | etiqueta | texto`. `desde` es la primera cifra del tramo (incluida), en la unidad principal; `-` en el primero, que no tiene límite por abajo. Si la guía da el límite también en la otra unidad, se puede poner los dos: `126 = 7,0`; si no, se calcula. Las cifras «hasta» de la tabla («de 100 a 125») salen solas del tramo siguiente. El texto, dos o tres frases, con su `[^n]` y, si encaja, las cifras que más se buscan nombradas con naturalidad («por ejemplo 105 o 110»).
- `extremos`: dónde empieza y acaba la barra. `posible`: cifras con sentido en la unidad principal; si alguien escribe algo fuera (por ejemplo 40 en una HbA1c en %), se le dice que revise la unidad y, si encaja en la otra, se le ofrece cambiarla.
- `normal`: el número del tramo de referencia (1 si no se pone). Los demás se pintan con tonos más intensos cuanto más lejos están de él, con los colores de la marca, nunca en rojo.
- `mirar`: qué conviene mirar a la vez (sale con el resultado). `ejemplo`: la cifra de muestra del campo.
- Donde el objetivo depende del riesgo, del sexo o de la edad (LDL, ApoB, ferritina, filtrado), la regla no pinta un único «normal»: dice la condición en cada tramo.

Reglas para estas páginas:
- **Cada cifra con su fuente** (`[^n]`): guías clínicas (ESC/EAS, ADA, NICE, OMS…), organismos oficiales (NIH, NHS, MedlinePlus) o artículos de PubMed. Nada de cifras sin cita.
- **No decir** que las ha revisado un médico mientras no sea verdad (brief de marca), ni prometer diagnosticar, curar o prevenir. «Salud preventiva» y «longevidad» sí (son el enfoque de Kuova); «antienvejecimiento» no. Kuova ayuda a medir, entender y seguir; nunca «alarga la vida».
- **Estudios observacionales**: decir que algo «se asoció con», no que «causa» o «reduce».
- **Comparativas**: solo hechos públicos y comprobables de cada marca, con la fecha en que se consultaron, sin desprestigiar a nadie. Revisarlas cada pocos meses: las marcas cambian rápido (en 2026, Apple, Oura y WHOOP lanzaron análisis de sangre en EE. UU.).

## SEO y buscadores con IA

- Cada página tiene título, descripción, versión en el otro idioma (hreflang) y tarjeta para redes; salen de `seo` en `site-copy.json`.
- `/sitemap.xml`, `/robots.txt` (abierto también a ChatGPT, Claude, Perplexity y Gemini), `/llms.txt` (resumen para asistentes de IA) y `/llms-full.txt` (el texto completo de guías, fichas y comparativas) se generan solos con estos mismos textos.
- **Fechas del sitemap** (`lastmod`): siempre la del último cambio real, nunca la hora de publicación, porque Google deja de fiarse de `lastmod` si se mueve sin cambios. Guías, fichas y comparativas usan su `revisado` (o `fecha`); los índices (`/aprende`, `/biomarcadores`, `/comparativas`), la de la página más reciente que listan; las legales, su «Última actualización» de `legal.ts`; y la portada, el campo `actualizado` de `inicio.json` y de `en/inicio.json`. **Si cambias la portada (textos, fotos o vídeos), pon la fecha de ese día en `actualizado`.** `/newsletter` va sin fecha mientras sus textos no tengan una.
- **IndexNow (Bing)**: después de cada publicación en producción, una GitHub Action (`.github/workflows/indexnow.yml`) avisa a Bing, y por el mismo protocolo a Yandex, Seznam y Naver, de las páginas cuyo contenido cambió desde la publicación anterior (las que salen de los archivos de `content/` tocados; los cambios de código no cuentan). Google no lo usa; Bing alimenta a Copilot y en parte a ChatGPT. La clave es pública por diseño y está en `public/<clave>.txt` y en `scripts/indexnow.mjs`. Se ve en GitHub → Actions → IndexNow y en Bing Webmaster Tools → IndexNow. A mano: `node scripts/indexnow.mjs --desde <commit> --hasta <commit> --prueba` dice qué enviaría sin enviarlo.
- La sección `en_breve` ("Kuova en pocas palabras") es la que más ayuda a que los asistentes de IA describan bien la empresa: mantenla corta, concreta y verdadera.
- Cuando haya dominio propio, se cambia la variable `NEXT_PUBLIC_SITE_URL` en Vercel y todo lo demás lo sigue.
- El nombre de la marca está en `marca.nombre` (y en los títulos de `seo`): es lo único que hay que cambiar cuando haya nombre definitivo.
