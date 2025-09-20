import google.generativeai as genai
import os

# Configurar la API Key de Gemini desde variable de entorno
api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    raise ValueError("Por favor, configura la variable de entorno GEMINI_API_KEY con tu clave de API de Google.")
genai.configure(api_key=api_key)

import requests
from bs4 import BeautifulSoup
import json
import re
import argparse
from urllib.parse import urlparse, urlunparse
from datetime import datetime

# Definir el modelo a usar (Gemini 1.5 Flash para mejor rendimiento)
modelo = genai.GenerativeModel('gemini-1.5-flash')

# Función para normalizar URLs sociales
def _normalize_url(href: str) -> str:
    try:
        parsed = urlparse(href)
        if not parsed.scheme:
            # asumir https si es relativo absoluto sin esquema
            parsed = parsed._replace(scheme='https')
        # quitar query y fragment para normalizar
        parsed = parsed._replace(query='', fragment='')
        return urlunparse(parsed)
    except Exception:
        return href

# Función para scrapear el contenido básico del sitio web
def scrape_website(domain: str, render: bool = False, timeout: int = 15) -> dict:
    try:
        url = f"https://{domain}"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Safari/537.36"}
        html_text = None

        if render:
            # renderizado opcional para sitios JS usando requests_html
            try:
                from requests_html import HTMLSession
                session = HTMLSession()
                r = session.get(url, headers=headers, timeout=timeout)
                # Renderizar con un tiempo de espera razonable
                r.html.render(timeout=timeout)
                html_text = r.html.html
            except Exception:
                # fallback a requests plano si falla el render
                resp = requests.get(url, headers=headers, timeout=timeout)
                resp.raise_for_status()
                html_text = resp.text
        else:
            resp = requests.get(url, headers=headers, timeout=timeout)
            resp.raise_for_status()
            html_text = resp.text

        soup = BeautifulSoup(html_text, 'html.parser')
        
        # Extraer título y meta descripción
        title = soup.title.string.strip() if soup.title and soup.title.string else 'No title found'
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        desc = meta_desc.get('content', '').strip() if meta_desc else 'No description found'
        
        # Extraer meta keywords
        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        keywords = meta_keywords.get('content', '').strip() if meta_keywords else ''
        
        # Extraer meta author
        meta_author = soup.find('meta', attrs={'name': 'author'})
        author = meta_author.get('content', '').strip() if meta_author else ''
        
        # Extraer enlaces a redes sociales
        social_links_set = set()
        for link in soup.find_all('a', href=True):
            href = link['href']
            if any(platform in href for platform in ['facebook.com', 'twitter.com', 'x.com', 'instagram.com', 'linkedin.com', 'youtube.com', 'tiktok.com', 'pinterest.com']):
                social_links_set.add(_normalize_url(href))
        social_links = sorted(list(social_links_set))
        
        # Extraer elementos de navegación
        nav_items = []
        for nav in soup.find_all(['nav', 'header', 'footer']):
            for link in nav.find_all('a', href=True):
                text = link.get_text().strip()
                if text and len(text) > 1 and text.lower() not in nav_items:
                    nav_items.append(text)
        # fallback a primeras listas si no se encontró nada
        if not nav_items:
            for ul in soup.find_all('ul')[:3]:
                for li in ul.find_all('li'):
                    text = li.get_text().strip()
                    if text and len(text) > 1 and text.lower() not in nav_items:
                        nav_items.append(text)
        navigation = nav_items[:15]
        
        # Extraer información de contacto
        contact_info = []
        # Buscar emails (dedupe y limitar)
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'
        emails = list(dict.fromkeys(re.findall(email_pattern, soup.get_text())))
        for email in emails[:5]:
            contact_info.append({"type": "email", "value": email})
        
        # Buscar teléfonos (patrón internacional simple)
        phone_pattern = r'\+?\d[\d\s().-]{7,}\d'
        phones = list(dict.fromkeys(re.findall(phone_pattern, soup.get_text())))
        for phone in phones[:5]:
            contact_info.append({"type": "phone", "value": phone})
        
        # Extraer productos destacados (de elementos con clases comunes)
        featured_products = []
        for element in soup.find_all(['div', 'li', 'a'], class_=re.compile(r'(product|item|featured|card)', re.I)):
            text = element.get_text().strip()
            if text and 5 < len(text) < 100 and text not in featured_products:
                featured_products.append(text)
        products = featured_products[:8]
        
        # Vista previa del contenido
        text_content = soup.get_text(separator=' ', strip=True)
        content_preview = text_content[:1000] + '...' if len(text_content) > 1000 else text_content
        
        return {
            "title": title,
            "description": desc,
            "keywords": [k.strip() for k in keywords.split(',')] if keywords else [],
            "author": author,
            "social_links": social_links,
            "navigation": navigation,
            "contact": contact_info,
            "featured_products": products,
            "content_preview": content_preview,
        }
    except Exception as e:
        return {"error": f"Error scraping {domain}: {str(e)}"}

# Función para enviar prompts a Gemini y obtener respuesta textual
def run_gemini_prompt(prompt: str) -> str:
    response = modelo.generate_content(prompt)
    return response.text

# Funciones para cada etapa del análisis

def extract_global_info(domain: str, scraped_data: dict) -> str:
    ctx = json.dumps(scraped_data, ensure_ascii=False)[:2000]
    prompt = f"""Analiza el dominio {domain}. 
    Usa la siguiente información scrapeada del sitio web: {ctx}
    Extrae métricas clave: tráfico total, fuentes (orgánico, directo, social, referido, email), 
    duración media de sesión, países principales, competidores directos e indirectos.
    Resume en texto claro y tabla resumen."""
    return run_gemini_prompt(prompt)

def analyze_seo(domain: str, scraped_data: dict) -> str:
    ctx = json.dumps(scraped_data, ensure_ascii=False)[:2000]
    prompt = f"""Para el dominio {domain}, usa la información scrapeada: {ctx}
    extrae las principales palabras clave orgánicas y pagadas, 
    volumen de búsqueda, posición en buscadores, análisis de backlinks y calidad de enlaces.
    Resume en texto y tabla."""
    return run_gemini_prompt(prompt)

def analyze_socials(domain: str, scraped_data: dict) -> str:
    ctx = json.dumps(scraped_data, ensure_ascii=False)[:2000]
    prompt = f"""Encuentra las cuentas oficiales de redes sociales asociadas al dominio {domain}, 
    usa la información scrapeada que incluye enlaces sociales: {ctx}
    indicando seguidores, tasa de engagement y tipo de contenido.
    Resume en texto y tabla."""
    return run_gemini_prompt(prompt)

def benchmarking(competitors: list[str]) -> str:
    comp_list = ', '.join(competitors)
    prompt = f"""Analiza los siguientes competidores: {comp_list}.
    Extrae métricas similares a las del dominio objetivo (tráfico, SEO, redes sociales).
    Compara fortalezas y debilidades.
    Resume en tabla y texto."""
    return run_gemini_prompt(prompt)

def analyze_market_trends(domain: str, scraped_data: dict) -> str:
    ctx = json.dumps(scraped_data, ensure_ascii=False)[:2000]
    prompt = f"""Basado en datos históricos y actuales para {domain}, usa información scrapeada: {ctx}
    identifica oportunidades de crecimiento, nichos desatendidos y tendencias clave del mercado.
    Resume en texto y tabla."""
    return run_gemini_prompt(prompt)

def synthesize_recommendations(domain: str) -> str:
    prompt = f"""Redacta un resumen ejecutivo claro y profesional con recomendaciones estratégicas 
    para {domain}, basado en los análisis previos.
    Incluye un análisis SWOT (DAFO) y propuestas de experimentos para validar hipótesis."""
    return run_gemini_prompt(prompt)

# Función principal para ejecutar el flujo completo
def main(domain: str, competitors: list[str], render: bool = False, out_path: str | None = None, no_stdout: bool = False):
    if not no_stdout:
        print(f"Generando informe de Sales Intelligence para: {domain}\n")

    # Scrape website data (dict estructurado)
    scraped_data = scrape_website(domain, render=render)
    if not no_stdout:
        print(f"Datos scrapeados (estructurado):\n{json.dumps(scraped_data, indent=2, ensure_ascii=False)}\n")

    if not no_stdout:
        print("\n--- Información Global ---\n")
    global_info = extract_global_info(domain, scraped_data)
    if not no_stdout:
        print(global_info)

    if not no_stdout:
        print("\n--- SEO y Contenidos ---\n")
    seo_info = analyze_seo(domain, scraped_data)
    if not no_stdout:
        print(seo_info)

    if not no_stdout:
        print("\n--- Redes Sociales ---\n")
    socials_info = analyze_socials(domain, scraped_data)
    if not no_stdout:
        print(socials_info)

    if not no_stdout:
        print("\n--- Benchmarking Competitivo ---\n")
    benchmarking_info = benchmarking(competitors)
    if not no_stdout:
        print(benchmarking_info)

    if not no_stdout:
        print("\n--- Oportunidades y Tendencias ---\n")
    market_trends = analyze_market_trends(domain, scraped_data)
    if not no_stdout:
        print(market_trends)

    if not no_stdout:
        print("\n--- Resumen Ejecutivo y Recomendaciones ---\n")
    recommendations = synthesize_recommendations(domain)
    if not no_stdout:
        print(recommendations)

    # Crear resultado en formato JSON
    result = {
        "timestamp": datetime.now().isoformat(),
        "domain": domain,
        "competitors": competitors,
        "scraped_data": scraped_data,
        "sections": {
            "global_info": global_info,
            "seo_info": seo_info,
            "socials_info": socials_info,
            "benchmarking_info": benchmarking_info,
            "market_trends": market_trends,
            "recommendations": recommendations
        }
    }

    if not no_stdout:
        print("\n--- Resultado en JSON ---\n")
        print(json.dumps(result, indent=2, ensure_ascii=False))

    # Guardar JSON en archivo
    filename = out_path or f"sales_intelligence_{domain}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    if not no_stdout:
        print(f"\n--- JSON guardado en: {filename} ---")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sales Intelligence Report Generator")
    parser.add_argument("--domain", type=str, default="marineLayer.com", help="Dominio objetivo (sin esquema)")
    parser.add_argument("--competitors", type=str, default="faherty.com,vuori.com,jcrew.com,buckmason.com,madewell.com", help="Lista de competidores separada por comas")
    parser.add_argument("--out", type=str, default=None, help="Ruta del archivo JSON de salida")
    parser.add_argument("--no-stdout", action="store_true", help="No imprimir resultados en consola, solo guardar JSON")
    parser.add_argument("--render", action="store_true", help="Intentar renderizado JS (requests_html)")
    args = parser.parse_args()

    domain = args.domain
    competitors = [c.strip() for c in args.competitors.split(',') if c.strip()]
    main(domain, competitors, render=args.render, out_path=args.out, no_stdout=args.no_stdout)
