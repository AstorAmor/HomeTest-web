# Cómo editar el contenido de la web

Todos los textos de la página están en esta carpeta, separados del código. Puedes editarlos con cualquier editor de texto (o Notepad) sin tocar nada de programación. Guarda el archivo y, si el servidor está encendido, los cambios se ven solos.

- **Para añadir o editar un biomarcador**: abre el archivo del bloque correspondiente dentro de `content/biomarcadores/` (por ejemplo `bloque-1-general.json`) y añade o edita un objeto dentro de la lista `biomarcadores` con estos campos: `id` (un identificador corto sin espacios, ej. `"vitamina-d"`), `nombre`, `muestra` (qué tipo de muestra hace falta), `explicacion` (2-3 frases sencillas) y `categoria_bloque`. El número de biomarcadores que se muestra en la home se calcula solo, no hace falta actualizarlo a mano.

- **Para añadir un bloque nuevo de biomarcadores**: crea un archivo nuevo en `content/biomarcadores/` siguiendo el mismo formato que los existentes, y avisa para que se añada a la lista de bloques que se muestran en la web.

- **Para cambiar las preguntas frecuentes**: edita `content/faq.json`. Cada pregunta es un objeto con `pregunta` y `respuesta`.

- **Para cambiar textos generales** (el titular de la portada, los botones, los textos de "cómo funciona", la tabla comparativa, el pie de página, los títulos de cada página para Google, etc.): edita `content/site-copy.json`. Está organizado por secciones con nombres descriptivos.

- **Importante**: en varios sitios verás el texto `PENDIENTE DE REDACTAR` o `[NOMBRE PENDIENTE]`. Son huecos a propósito para que no se publique contenido médico o de marca sin revisar. Sustitúyelos por el texto definitivo cuando lo tengas listo.

- **No hace falta tocar ningún otro archivo** de la carpeta `app/` o `components/` para cambiar textos: esos archivos solo se encargan del diseño y de mostrar lo que hay aquí.

## Inglés / español

La web sale en los dos idiomas (botón "English"/"Español" arriba; por defecto, el idioma del navegador).
- Textos en español: los archivos de arriba. Textos en inglés: `content/en/` (`site-copy.json`, `faq.json`
  y `biomarcadores.json`, que traduce nombres y bloques por `id`). **Si cambias un texto, cámbialo en los dos.**
- Lo que tenga `PENDIENTE DE REDACTAR` no se publica (explicaciones de biomarcadores y respuestas de FAQ).
- Política de privacidad y condiciones: `content/legal.ts`, siempre en los dos idiomas en la misma página.
