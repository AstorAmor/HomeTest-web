# Cómo editar el contenido de la web

Todos los textos de la página están en esta carpeta, separados del código. Puedes editarlos con cualquier editor de texto sin tocar nada de programación. Después hay que volver a publicar la web (`npx vercel deploy --prod`).

## Español e inglés

La web sale en los dos idiomas, cada uno con su dirección: `/` en español y `/en` en inglés (botón "English"/"Español" arriba). La primera vez, quien tenga el navegador en otro idioma entra directamente a `/en`.

- Español: los archivos de esta carpeta. Inglés: `content/en/`. **Si cambias un texto, cámbialo en los dos.**
- Lo que tenga `PENDIENTE DE REDACTAR` no se publica (respuestas de FAQ, explicaciones de biomarcadores).

## Qué archivo tocar

- **Portada, botones, menús, pie, títulos para Google**: `site-copy.json` (y `en/site-copy.json`). La portada está en `home`, sección a sección y en el mismo orden en que aparece en la página:
  `hero` (frase principal) → `cifras` → `aprende` → `biomarcadores` → `app` → `accion` (plan y objetivos) → `como_funciona` → `profesionales` → `datos` → `en_breve` → `faq` → `cta_final` (lista de espera).
- **Preguntas frecuentes**: `faq.json` (y `en/faq.json`). Salen en la portada, en `/faq` y en los datos para Google.
- **Biomarcadores (panel completo, 110+)**: NO se edita aquí. Sale de la base de conocimiento de la app (`HomeTest/knowledge/biomarcadores/`). Para actualizarlo: `node scripts/sync-panel.mjs` (genera `panel.json`).
- **Packs por objetivo** (chequeo general, rendimiento, salud sexual, salud reproductiva): `biomarcadores/bloque-*.json`; nombres en inglés en `en/biomarcadores.json` (por `id`).
- **Política de privacidad y condiciones**: `legal.ts`, siempre en los dos idiomas en la misma página.

## Fotos, capturas y vídeos

- Fotos: `public/images/photos/`. Ahora mismo son **provisionales** (las mismas de la app). Para cambiar una, sustituye el archivo con el mismo nombre, o cambia la ruta en `site-copy.json`.
- Capturas de la app: `public/images/app/` (tema claro, 390×844 o el doble).
- **Vídeo de fondo en la portada**: copia el vídeo a `public/videos/` (por ejemplo `hero.mp4`) y en `site-copy.json` → `home.hero.video` pon `"/videos/hero.mp4"` (en los dos idiomas). Mientras sea `null`, se ve la foto con un zoom lento. Recomendado: MP4 H.264, 1920×1080, 8–15 s en bucle, sin sonido, menos de 4 MB.
- Imagen al compartir en redes (WhatsApp, LinkedIn...): `public/images/og.jpg` (1200×630).

## Opiniones de profesionales

`home.profesionales.testimonios` está vacío a propósito y, mientras lo esté, esa parte no se muestra. Solo se rellena con **citas reales y con permiso por escrito** de cada profesional:

```json
{ "cita": "…", "nombre": "Dra. Nombre Apellido", "cargo": "Medicina de familia, Madrid", "foto": "/images/photos/…" }
```

## SEO y buscadores con IA

- Cada página tiene título, descripción, versión en el otro idioma (hreflang) y tarjeta para redes; salen de `seo` en `site-copy.json`.
- `/sitemap.xml`, `/robots.txt` (abierto también a ChatGPT, Claude, Perplexity y Gemini) y `/llms.txt` (resumen para asistentes de IA) se generan solos con estos mismos textos.
- La sección `en_breve` ("HomeTest en pocas palabras") es la que más ayuda a que los asistentes de IA describan bien la empresa: mantenla corta, concreta y verdadera.
- Cuando haya dominio propio, se cambia la variable `NEXT_PUBLIC_SITE_URL` en Vercel y todo lo demás lo sigue.
- El nombre de la marca está en `marca.nombre` (y en los títulos de `seo`): es lo único que hay que cambiar cuando haya nombre definitivo.
