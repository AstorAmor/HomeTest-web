---
titulo: Tu analítica no es una foto fija
subtitulo: Qué significa un resultado, por qué el rango de referencia no es tu rango y cuándo un cambio es real.
descripcion: Cómo leer un biomarcador con rigor: variación biológica y del laboratorio, rangos de referencia, el valor de referencia del cambio (VRC) y cuándo volver a medir. Con gráficas y fuentes científicas.
categoria: Medir bien
fecha: 2026-10-09
lectura: 8 min
estado: borrador
---

Cuando recibes una analítica, cada número parece una verdad exacta: 92 mg/dL de glucosa, 31 ng/mL de vitamina D. Pero un resultado es la medida de algo que se mueve. Tu cuerpo oscila alrededor de su propio punto de equilibrio, el laboratorio tiene un pequeño margen de error y la forma de tomar la muestra también cuenta.

Entender esas tres cosas cambia la manera de leer una analítica: menos alarma por un valor suelto y más atención a tu tendencia.

## Tres fuentes de variación

Si repites la misma prueba varias veces, no obtendrás el mismo número. La diferencia viene de tres sitios[^1]:

- **Antes del análisis.** Cómo y cuándo se toma la muestra: ayuno, hora del día, ejercicio reciente, transporte. Es la fuente de error más fácil de evitar.
- **El laboratorio.** Ningún método mide de forma perfecta. Un laboratorio acreditado conoce su imprecisión (se llama *CVa*) y la controla a diario; suele ser de pocos puntos porcentuales.
- **Tu propio cuerpo.** Aunque estés sano y estable, tus valores suben y bajan alrededor de tu punto de equilibrio (es la variación biológica, *CVi*). En algunos marcadores es mínima: la HbA1c varía en torno a un 2 %. En otros es enorme: los triglicéridos, cerca de un 20 %, y la PCR, más de un 40 %[^2][^3].

Estas variaciones se miden en estudios con personas sanas a las que se analiza repetidamente, y la Federación Europea de Medicina de Laboratorio (EFLM) revisa la calidad de cada estudio antes de dar sus cifras por buenas[^4].

## El rango de referencia es de la población, no el tuyo

El rango que aparece junto a tu resultado se calcula con personas sanas: es el intervalo en el que cae el 95 % central de ellas. Eso tiene dos consecuencias importantes.

**Tu rango personal suele ser mucho más estrecho que el de la población.** En la mayoría de marcadores, lo que separa a unas personas de otras es mayor que lo que cada una varía consigo misma. Un valor «dentro de rango» puede ser un cambio importante para ti, y uno ligeramente fuera puede ser tu normalidad. Esta idea, el índice de individualidad, se describió en 1974[^5] y sigue siendo la razón principal para comparar cada resultado con tus valores anteriores.

[[grafica:individualidad]]

**Fuera de rango no significa enfermo, y dentro de rango no garantiza que todo esté bien.** Por definición, 1 de cada 20 personas sanas queda fuera del rango en cada prueba. Cuantas más pruebas, más probable es que alguna salga marcada sin que pase nada: con 20 marcadores, casi dos de cada tres personas sanas tendrían al menos uno fuera de rango.

[[grafica:fuera-de-rango]]

Por eso un resultado aislado y ligeramente fuera de rango se interpreta junto con el resto de la analítica, tus síntomas y tus valores anteriores. Si un resultado te preocupa, coméntalo con un profesional sanitario.

## ¿Cuándo un cambio es real?

Si tu colesterol LDL pasa de 130 a 118 mg/dL, ¿has mejorado? Depende de cuánto varían tu cuerpo y el laboratorio. La medicina de laboratorio lo resuelve con el **valor de referencia del cambio (VRC)**: la diferencia mínima entre dos resultados para que, con un 95 % de confianza, no sea solo ruido[^6].

> VRC = 1,96 × √2 × √(CVi² + CVa²)

Con los valores publicados de variación biológica y una imprecisión típica de laboratorio, el margen cambia muchísimo de un marcador a otro:

[[grafica:vrc]]

En el ejemplo del LDL, una bajada del 9 % queda dentro del margen de ±23 %: puede ser real, pero dos medidas no bastan para afirmarlo. En cambio, si tu vitamina D pasa de 16 a 30 ng/mL, una subida del 88 %, el cambio es claro.

Dos ideas prácticas. Compara siempre con tu resultado anterior, no solo con el rango. Y si el efecto que buscas es pequeño, hará falta más de una medida para verlo: promediar varias medidas reduce el margen (con 4 medidas a cada lado, a la mitad).

## Cuándo volver a medir

Cada marcador tiene su propio reloj. Medir demasiado pronto después de un cambio (una dieta, un suplemento, un tratamiento) da un falso «no ha funcionado».

- **Vitamina D.** La forma que se mide en sangre, la 25(OH)D, tiene una vida media de unos 15 días[^7]. Tras cambiar la dosis tarda unos 2 o 3 meses en estabilizarse.
- **HbA1c.** Resume la glucosa de los meses anteriores[^8], con más peso en las últimas semanas: tras un cambio sostenido, la mitad del efecto se ve en unos 35 días y el efecto completo, hacia los 3 o 4 meses[^9].
- **Omega-3 Index.** Se mide en la membrana de los glóbulos rojos, así que también cambia despacio: el efecto completo de un cambio en la dieta tarda unos 4 meses. Un índice del 8 % o más se asoció con el menor riesgo cardiovascular en los estudios que lo propusieron[^10].

[[grafica:tiempos]]

## Cómo hacer que dos analíticas sean comparables

Lo que más está en tu mano es repetir las mismas condiciones cada vez[^11]:

- **Misma hora y mismo ayuno** que la vez anterior. Varios marcadores cambian a lo largo del día o después de comer.
- **Sin ejercicio intenso los días previos.** Puede subir de forma pasajera marcadores musculares y hepáticos.
- **Encontrándote bien.** Una infección o una inflamación reciente suben la PCR y la ferritina, que entonces deja de reflejar bien tus reservas de hierro[^12].
- **Avisa si tomas biotina** (vitamina B7, frecuente en suplementos para pelo y uñas). En un estudio con voluntarios sanos, 10 mg al día durante una semana alteraron 9 de 23 pruebas de laboratorio que usan biotina en su método, entre ellas las de tiroides[^13].
- **Mismo laboratorio y método** cuando sea posible: métodos distintos pueden dar cifras algo distintas para la misma muestra.

## Cómo lo aplicamos en Kuova

Estas ideas guían cómo diseñamos Kuova: cada marcador junto a tu historial y no solo junto al rango de la población, con el margen de cambio propio de ese marcador y con una fecha sensata para volver a medir.

*Este artículo es divulgativo y no sustituye la valoración de un profesional sanitario.*

[^1]: Fraser CG, Harris EK. Generation and application of data on biological variation in clinical chemistry. *Crit Rev Clin Lab Sci*. 1989;27(5):409-37. [doi:10.3109/10408368909106595](https://doi.org/10.3109/10408368909106595)
[^2]: Ricós C, Álvarez V, Cava F, et al. Current databases on biological variation: pros, cons and progress. *Scand J Clin Lab Invest*. 1999;59(7):491-500. [doi:10.1080/00365519950185229](https://doi.org/10.1080/00365519950185229)
[^3]: EFLM Biological Variation Database. [biologicalvariation.eu](https://biologicalvariation.eu)
[^4]: Aarsand AK, Røraas T, Fernandez-Calle P, et al. The Biological Variation Data Critical Appraisal Checklist: a standard for evaluating studies on biological variation. *Clin Chem*. 2018;64(3):501-14. [doi:10.1373/clinchem.2017.281808](https://doi.org/10.1373/clinchem.2017.281808)
[^5]: Harris EK. Effects of intra- and interindividual variation on the appropriate use of normal ranges. *Clin Chem*. 1974;20(12):1535-42. [PubMed 4430131](https://pubmed.ncbi.nlm.nih.gov/4430131/)
[^6]: Fraser CG. Reference change values. *Clin Chem Lab Med*. 2011;50(5):807-12. [doi:10.1515/CCLM.2011.733](https://doi.org/10.1515/CCLM.2011.733)
[^7]: Jones G. Pharmacokinetics of vitamin D toxicity. *Am J Clin Nutr*. 2008;88(2):582S-586S. [doi:10.1093/ajcn/88.2.582S](https://doi.org/10.1093/ajcn/88.2.582S)
[^8]: Nathan DM, Kuenen J, Borg R, et al. Translating the A1C assay into estimated average glucose values. *Diabetes Care*. 2008;31(8):1473-8. [doi:10.2337/dc08-0545](https://doi.org/10.2337/dc08-0545)
[^9]: Tahara Y, Shima K. Kinetics of HbA1c, glycated albumin, and fructosamine and analysis of their weight functions against preceding plasma glucose level. *Diabetes Care*. 1995;18(4):440-7. [doi:10.2337/diacare.18.4.440](https://doi.org/10.2337/diacare.18.4.440)
[^10]: Harris WS, von Schacky C. The Omega-3 Index: a new risk factor for death from coronary heart disease? *Prev Med*. 2004;39(1):212-20. [doi:10.1016/j.ypmed.2004.02.030](https://doi.org/10.1016/j.ypmed.2004.02.030)
[^11]: Simundic AM, Bölenius K, Cadamuro J, et al. Joint EFLM-COLABIOCLI Recommendation for venous blood sampling. *Clin Chem Lab Med*. 2018;56(12):2015-38. [doi:10.1515/cclm-2018-0602](https://doi.org/10.1515/cclm-2018-0602)
[^12]: Organización Mundial de la Salud. WHO guideline on use of ferritin concentrations to assess iron status in individuals and populations. Ginebra: OMS; 2020. [who.int](https://www.who.int/publications/i/item/9789240000124)
[^13]: Li D, Radulescu A, Shrestha RT, et al. Association of biotin ingestion with performance of hormone and nonhormone assays in healthy adults. *JAMA*. 2017;318(12):1150-60. [doi:10.1001/jama.2017.13705](https://doi.org/10.1001/jama.2017.13705)
