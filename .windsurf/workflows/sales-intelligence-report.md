---
description: Pipeline de Generación de Reportes de Sales Intelligence
---

## **Pasos para Generar un Reporte de Sales Intelligence Automatizado**

### **1. Configuración del Entorno**
// turbo
- Instalar dependencias necesarias: `npm install puppeteer cheerio axios openai`
- Configurar APIs gratuitas (Facebook Graph, Instagram Basic Display, X API)
- Preparar credenciales para herramientas gratuitas (Similarweb, Ahrefs, etc.)
- Crear directorio de trabajo: `mkdir sales_intelligence_reports`

### **2. Definición del Target**
- Especificar dominio objetivo (ej: marinelayer.com)
- Validar que el sitio esté activo y accesible
- Definir scope: productos/servicios principales a analizar
- Configurar archivo de configuración JSON con parámetros iniciales

### **3. Recolección de Información Global (Sección 1.1-1.10)**

#### **3.1. Productos/Servicios (1.1.)**
- **Scraping del sitio web**: Extraer descripción de productos, categorías, precios
- **Análisis de blog y FAQ**: Políticas de devolución, sostenibilidad
- **Herramientas**: Playwright para navegación, Cheerio para parsing
- **Salida**: JSON con lista de productos y características

#### **3.2. Audiencia Objetivo (1.2.)**
- **Análisis de redes sociales**: Edad, ubicación, intereses
- **Scraping de anuncios**: Copy publicitario en Google/Facebook
- **Herramientas**: Google Alerts, scraping de testimonios
- **Salida**: Perfil demográfico estimado

#### **3.3. Historia y Mercado (1.3.)**
- **Consulta Crunchbase y LinkedIn**: Milestones, funding, crecimiento
- **Búsqueda en Google News**: Artículos de prensa
- **Herramientas**: Web scraping, resumen con ChatGPT
- **Salida**: Timeline histórica del negocio

#### **3.4. Unique Selling Points (1.4.)**
- **Análisis de homepage y slogans**: Diferenciadores clave
- **Comparación con competidores**: Análisis competitivo
- **Herramientas**: ChatGPT para identificación de USP
- **Salida**: Lista de ventajas competitivas

#### **3.5. Competidores (1.5.)**
- **Similarweb gratuito**: Top 5 competidores por tráfico
- **Google "related:dominio.com"**: Lista adicional
- **Herramientas**: Scraping, ChatGPT para categorización
- **Salida**: Lista de competidores con métricas básicas

#### **3.6. Keywords (1.6.)**
- **Ubersuggest gratuito**: Keywords principales
- **AnswerThePublic**: Preguntas relacionadas
- **Herramientas**: Scraping de meta keywords
- **Salida**: Lista de keywords branded y non-branded

#### **3.7. Redes Sociales (1.7.)**
- **APIs públicas**: Facebook Graph, Instagram Basic Display
- **Scraping de enlaces**: Desde footer del sitio
- **Herramientas**: SocialBlade gratuito, análisis de engagement
- **Salida**: Métricas de seguidores y engagement por plataforma

#### **3.8. Reviews (1.8.)**
- **Scraping de Google Reviews, Trustpilot, Yelp**
- **Análisis de sentimiento**: Con ChatGPT/Gemini
- **Herramientas**: Playwright para navegación, procesamiento de texto
- **Salida**: Resumen de reseñas con puntuaciones promedio

#### **3.9. Performance Financiera (1.9.)**
- **Crunchbase**: Datos de funding y empleados
- **LinkedIn**: Crecimiento de equipo
- **Herramientas**: ChatGPT para síntesis de información pública
- **Salida**: Estimaciones de revenue y crecimiento

#### **3.10. Resumen Ejecutivo (1.10.)**
- **Síntesis automática**: Combinar toda la información anterior
- **Herramientas**: ChatGPT para generar resumen profesional
- **Salida**: Documento ejecutivo con insights clave

### **4. Inteligencia Estratégica de Mercado (Sección 2.1-2.2.4)**

#### **4.1. Posición en el Mercado a lo Largo del Tiempo (2.1.)**
- **Archive.org**: Evolución histórica del sitio
- **Google Trends**: Tendencias de búsqueda
- **Herramientas**: Screenshots históricos, análisis temporal
- **Salida**: Timeline de crecimiento y cambios

#### **4.2. Top Competidores Orgánicos (2.2.)**
- **Similarweb**: Top 5 con datos de tráfico
- **Ahrefs gratuito**: Backlinks y keywords
- **Herramientas**: Exportación de datos, comparación
- **Salida**: Perfiles detallados de competidores SEO

### **5. Análisis de Crecimiento SEO de Competidores (Sección 3.1-3.6)**

#### **5.1. Dominios Referentes (3.1.)**
- **Ahrefs/Moz gratuitos**: Lista de backlinks
- **Herramientas**: Exportación y categorización
- **Salida**: Lista de dominios con autoridad

#### **5.2. Domain Rating (3.2.)**
- **Ahrefs/Moz**: Métrica de autoridad
- **Herramientas**: Consulta de perfiles públicos
- **Salida**: Puntuación DR/DA por competidor

#### **5.3. Tráfico Orgánico Promedio (3.3.)**
- **Similarweb**: Estimación mensual
- **Herramientas**: Exportación de datos históricos
- **Salida**: Gráficos de evolución de tráfico

#### **5.4. Valor del Tráfico Orgánico (3.4.)**
- **Estimación CPC**: Multiplicar tráfico por costo promedio
- **Herramientas**: Google Keyword Planner, cálculos automáticos
- **Salida**: Valor monetario estimado

#### **5.5. Páginas Orgánicas (3.5.)**
- **Screaming Frog gratuito**: Crawleo hasta 500 URLs
- **Google "site:"**: Páginas indexadas
- **Salida**: Conteo y lista de páginas

#### **5.6. Paid Search (3.6.)**
- **Semrush gratuito**: Análisis de anuncios
- **Búsqueda manual**: SERPs con y sin adblocker
- **Salida**: Estimación de inversión en paid search

### **6. Secciones Adicionales**

#### **6.1. Overview de Tráfico**
- **Similarweb**: Fuentes de tráfico, países, dispositivos
- **Herramientas**: Exportación de gráficos
- **Salida**: Dashboard de métricas de tráfico

#### **6.2. Dinámica de la Industria**
- **Google Trends, Statista gratuito**: Tendencias del sector
- **Herramientas**: Búsqueda académica, síntesis con AI
- **Salida**: Análisis de tendencias de mercado

#### **6.3. Análisis de Sentimiento de Marca**
- **Scraping de reseñas**: Análisis de texto
- **Herramientas**: ChatGPT para sentiment analysis
- **Salida**: Score de sentimiento positivo/negativo

#### **6.4. Tech Stack y UX**
- **BuiltWith, Wappalyzer**: Tecnologías utilizadas
- **PageSpeed Insights**: Performance y UX
- **Salida**: Perfil técnico del sitio

### **7. Síntesis y Generación del Reporte**

#### **7.1. Compilación de Datos**
- **Agregación automática**: Combinar todos los datos recolectados
- **Validación**: Verificar consistencia de información
- **Herramientas**: Scripts de procesamiento JSON

#### **7.2. Generación con AI**
- **Prompts estructurados**: Usar generate-prompts.mjs
- **Integración ChatGPT**: Generar texto narrativo
- **Salida**: Reporte completo en formato JSON

#### **7.3. Exportación**
- **Formatos múltiples**: PDF, Markdown, Notion
- **Personalización**: Según necesidades del cliente
- **Salida**: Archivos finales listos para entrega

### **8. Documentación y Mantenimiento**

#### **8.1. Logging**
- **Registro de fuentes**: Documentar origen de cada dato
- **Timestamps**: Fechas de recolección
- **Limitaciones**: Notas sobre datos estimados

#### **8.2. Actualización**
- **Monitoreo continuo**: Alertas de cambios en competidores
- **Re-ejecución programada**: Actualizaciones automáticas
- **Mantenimiento**: Actualizar scripts según cambios en APIs

---

## **Herramientas y Dependencias Requeridas**

### **Core Dependencies**
```
npm install:
- puppeteer: Navegación web y scraping
- cheerio: Parsing HTML
- axios: HTTP requests
- openai: Integración con ChatGPT
- fs-extra: Manejo de archivos
- moment: Fechas y timestamps
```

### **APIs y Servicios Gratuitos**
- **Facebook Graph API**: Datos de páginas
- **Instagram Basic Display API**: Información de perfiles
- **X (Twitter) API**: Métricas de cuentas
- **Similarweb**: Análisis de tráfico gratuito
- **Ahrefs/Moz**: Versiones gratuitas limitadas
- **Google Trends**: Tendencias de búsqueda
- **PageSpeed Insights**: Análisis de performance

### **Herramientas de Desarrollo**
- **Screaming Frog**: SEO crawler gratuito (500 URLs)
- **BuiltWith**: Tech stack analysis
- **Wappalyzer**: Extension para browser
- **AnswerThePublic**: Keywords research
- **Ubersuggest**: Keywords y competidores

---

## **Ejecución del Workflow**

```bash
# 1. Configurar entorno
npm install

# 2. Definir target
node scripts/setup-target.js --domain marinelayer.com

# 3. Ejecutar recolección completa
node scripts/generate-report.js --full

# 4. Generar reporte final
node scripts/export-report.js --format pdf
```

---

## **Consideraciones Técnicas**

- **Rate Limiting**: Respetar límites de APIs gratuitas
- **Caching**: Almacenar datos para evitar re-scraping
- **Error Handling**: Manejo robusto de fallos de red/APIs
- **Privacy**: Respetar términos de servicio y leyes de datos
- **Actualizaciones**: Mantener scripts actualizados con cambios en APIs

---

## **Métricas de Éxito**

- **Cobertura**: 80%+ de secciones completadas automáticamente
- **Precisión**: 70%+ de datos validados vs fuentes oficiales
- **Tiempo**: Generación completa en < 30 minutos
- **Costos**: Mantener todo gratuito o < $10/mes

¿Quieres que implemente algún paso específico o crees scripts de ejemplo para alguna sección?
