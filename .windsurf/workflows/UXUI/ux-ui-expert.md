---
description: Experto UX/UI — Auditoría integral de una página web (accesibilidad, UX, UI, rendimiento, SEO)
---

# Objetivo
Realizar una auditoría UX/UI completa sobre una URL proporcionada, identificando absolutamente TODAS las desviaciones respecto a buenas prácticas (WCAG 2.2 AA, heurísticas de Nielsen, pautas de diseño visual y contenido, rendimiento, SEO técnico, responsive, formularios, interacción y seguridad). Genera hallazgos exhaustivos, evidencia (capturas, selectores, fragmentos HTML/CSS), impacto, severidad y recomendaciones accionables.

# Entradas requeridas
- URL a auditar: <coloca aquí la URL>
- Contexto de negocio (opcional): ICP/objetivos de la página
- Público objetivo (opcional)

# Entregables
- Informe de hallazgos exhaustivo con:
  - Resumen ejecutivo
  - Lista priorizada (P0/P1/P2) con impacto en negocio y esfuerzo estimado
  - Evidencia: capturas, selectores, HTML/CSS relevante, métricas
  - Plan de remediación por sprints (quick wins vs. cambios estructurales)
- Checklist marcado con cumplimiento/no cumplimiento por categoría

# Preparación del entorno
1. Abre la URL en el Windsurf Browser o usa MCP Playwright/Puppeteer para navegar y capturar estado.
2. Habilita los DevTools: consola, red, performance y coverage.
3. Si hay login, documenta el flujo mínimo para entrar y auditar (no incluyas credenciales sensibles en el repo).

# Metodología paso a paso

## 1) Accesibilidad (WCAG 2.2 AA)
- Revisa estructura semántica:
  - Debe existir un `h1` único, jerarquía correcta de `h2-h6` sin saltos ilógicos.
  - Landmarks ARIA/HTML5: `header`, `nav`, `main`, `aside`, `footer`, `form`, `section`, `article` definidos y no redundantes.
- Textos alternativos y nombres accesibles:
  - Todas las imágenes no decorativas con `alt` significativo; decorativas con `role="presentation"` o `alt=""`.
  - Controles interactivos con `aria-label` o texto visible adecuado; `title` no reemplaza nombre accesible.
- Contraste de color:
  - Texto normal ≥ 4.5:1, texto grande ≥ 3:1, iconografía esencial ≥ 3:1.
  - Verifica estados hover/focus/disabled; no confiar solo en color para diferenciar estados.
- Teclado y foco:
  - Navegación completa con teclado, orden lógico del foco, foco siempre visible (outline no removido).
  - `skip links` al contenido principal funcionan y son visibles al enfocarse.
- Roles y ARIA:
  - Usa ARIA solo cuando sea necesario; evita roles contradictorios o atributos inválidos.
  - Componentes custom (dropdowns, modals, tabs) con patrones WAI-ARIA correctos.
- Movimiento y animación:
  - Respeta `prefers-reduced-motion`; evita parpadeos/flash 3+ veces por segundo.
- Formularios accesibles:
  - `label` asociada a cada control, `aria-describedby` para errores/ayuda, mensajes claros y persistentes.
- Idioma y lectura:
  - `lang` en `<html>` correcto; evita texto en imágenes; lectura a 8º-10º grado aprox.

Evidencia a capturar: HTML relevante, selectores, capturas con resaltado, mediciones de contraste.

## 2) Rendimiento y Core Web Vitals
- Lighthouse (Performance, Accessibility, Best Practices, SEO) y Web Vitals (LCP, CLS, INP):
  - LCP < 2.5s, CLS < 0.1, INP < 200ms (objetivos recomendados).
- Payload y recursos:
  - JS total, CSS total, imágenes; detectar recursos no usados con Coverage.
  - Eliminar render-blocking; diferir/async para terceros; dividir código (code-splitting).
- Imágenes y fuentes:
  - Formatos modernos (AVIF/WebP), `srcset/sizes`, `loading="lazy"`, `decoding="async"`.
  - Fuentes con `font-display: swap`, subset por idioma, preloads justificados.
- Caching y red:
  - `Cache-Control`, `ETag`, `immutable` donde aplique; compresión gzip/br brotli activa.
  - Minimizar solicitudes a terceros, auditar impacto y deferir si es posible.

Evidencia: reporte Lighthouse, waterfall de red, capturas de Coverage, listado de terceros y tiempos.

## 3) Responsive y dispositivos
- Viewport y breakpoints:
  - `meta viewport` correcto; prueba en sm/md/lg/xl/2xl; no overflow horizontal.
- Target táctil y gestos:
  - Objetivos táctiles ≥ 44x44px; sin gestos obligatorios no obvios; estados activos claros.
- Layout adaptable:
  - Grillas fluidas, uso de unidades relativas, safe-areas en iOS, soporte orientación.

Evidencia: capturas por breakpoint, notas de overflow/clipping, medidas de targets.

## 4) Contenido, IA y SEO on-page
- Jerarquía y claridad:
  - Valor principal visible en 3-5s; títulos claros, subtítulos explicativos, escaneabilidad.
- Microcopy y claridad de acción:
  - CTAs con verbos claros; evitar ambigüedad; estados vacíos con instrucciones.
- Estructura SEO:
  - Título y meta descripción únicos; uso de `rel="canonical"`; encabezados coherentes.
  - Datos estructurados (schema.org) cuando aplique; atributos `hreflang` si multilenguaje.
- Enlaces:
  - Texto de enlace descriptivo; evita "haz clic aquí"; no enlaces rotos o 404.

Evidencia: HTML de `<head>`, lista de headings, ejemplos de copy, validadores de schema.

## 5) Diseño visual y legibilidad
- Tipografía:
  - Escala tipográfica consistente, `line-height` adecuado (1.4–1.8), longitud de línea 45–90 caracteres.
- Espaciado y ritmo:
  - Sistema de 4/8px; consistencia entre secciones; suficiente aire/espacio en blanco.
- Color y estados:
  - Paleta y tokens consistentes; estados hover/focus/active/disabled siempre visibles.
- Alineación y densidad:
  - Alineaciones de grilla; evitar saltos visuales; reducir ruido y elementos redundantes.

Evidencia: capturas anotadas, referencias a tokens/variables CSS, inspección de estilos.

## 6) Navegación e IA de la información
- Menú y rutas:
  - Navegación comprensible; estado activo claro; breadcrumb si profundidad >1.
- Buscabilidad y descubrimiento:
  - Campo de búsqueda accesible, resultados con vacíos útiles; menús no esconden acciones clave.
- Footer y páginas de sistema:
  - Footer con enlaces esenciales; 404/500 útiles con rutas de escape.

Evidencia: mapa de navegación, capturas de interacción, listado de rutas.

## 7) Formularios y validación
- Labels y ayudas:
  - `label` explícito, placeholders no reemplazan label; ayudas contextuales.
- Estados y errores:
  - Validaciones en tiempo real; mensajes específicos; persistencia tras recarga; accesibles por lector de pantalla.
- Autocomplete y teclado:
  - `autocomplete`, `inputmode`, atajos, tab order correcto.

Evidencia: capturas de flujo, atributos de inputs, reglas de validación.

## 8) Interacción, microinteracciones y estado
- Feedback inmediato:
  - Cargas con spinners/skeletons; bloqueos mínimos; no estados silenciosos.
- Foco y retorno:
  - En modales, foco atrapado y retorno al elemento previo al cerrar.
- Acciones destructivas:
  - Confirmaciones, undo cuando sea posible; accesibilidad de toasts/alerts.

Evidencia: videos/capturas, roles/atributos ARIA, trazas de eventos.

## 9) Seguridad del front y privacidad
- HTTPS y mixed content; `Content-Security-Policy` razonable.
- Cookies con `SameSite`, `Secure`; banners de consentimiento no bloqueantes indebidamente.
- Inputs sensibles con tipos y mascarillas adecuadas; evita exponer tokens en el front.

Evidencia: cabeceras, resultados de security headers, network details.

## 10) Internacionalización y localización (si aplica)
- Soporte RTL; formatos de fecha/número; pluralización correcta.
- Separación de cadenas; no texto duro en componentes.

Evidencia: configuración i18n, capturas RTL, validaciones de formatos.

# Ejecución con herramientas (MCP Playwright/Puppeteer)
Estas acciones son guía para ejecutar dentro de Windsurf con servidores MCP disponibles.

1. Navegar a la URL y tomar snapshot/screenshot
   - Usar: mcp-playwright o puppeteer
   - Acciones: navegar, `waitForLoadState('networkidle')`, capturar `snapshot` y `screenshot` por breakpoints.
2. Recoger logs de consola y red
   - Capturar errores, warnings, peticiones bloqueadas, tiempos de terceros.
3. Medir Lighthouse (manual si no hay integración directa)
   - Alternativa: usar Chrome DevTools y adjuntar reportes exportados.
4. Extraer estructura de headings y landmarks
   - Ejecutar en consola:
     ```js
     [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
       .map(h=>({tag:h.tagName, text:h.textContent.trim()}))
     ```
   - Landmarks:
     ```js
     [...document.querySelectorAll('header,nav,main,aside,footer,form,section,article')]
       .map(n=>n.tagName)
     ```
5. Contraste de color (muestra)
   - Verificar con DevTools o extensiones; documentar color foreground/background y ratio.
6. Coverage y assets no usados
   - Pestaña Coverage: listar JS/CSS con % no usado; proponer tree-shaking/splitting.

# Criterios de severidad e impacto
- P0 (Crítico): Bloquea tareas clave, incumple WCAG severo, rompe flujos o daña seriamente SEO/performance.
- P1 (Alto): Afecta tareas principales, accesibilidad/UX subóptima con impacto claro.
- P2 (Medio/Bajo): Inconsistencias visuales, microcopys, pulido.

# Plantilla de salida (usa y completa)
- Resumen ejecutivo:
- Métricas clave (LCP/CLS/INP, Lighthouse):
- Hallazgos (tabla o lista priorizada):
  - ID | Categoría | Severidad | Evidencia | Recomendación | Esfuerzo
- Quick wins (7-14 días):
- Cambios estructurales (1-3 sprints):
- Anexos: capturas, code snippets, reportes Lighthouse.

# Notas
- No omitas nada: si una pauta no aplica, indicarlo y justificar.
- Evita juicios subjetivos sin evidencia; siempre cita selector/HTML/medición.
- Mantén un registro por commit de hallazgos y correcciones para trazabilidad.
