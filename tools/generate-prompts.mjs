// tools/generate-prompts.mjs
// Creates a directory per reporting section under src/prompts/{key}/prompt.md
// Usage:
//   node tools/generate-prompts.mjs --domain marinelayer.com --competitors "faherty.com,vuori.com"
// Optional flags:
//   --outRoot src/prompts
// Notes: Safe to re-run; it will overwrite prompt.md files.

import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...rest] = a.split('=');
    const key = k.replace(/^--/, '');
    const v = rest.join('=') || true;
    return [key, v];
  })
);

const DOMAIN = (args.domain || 'example.com').trim();
const COMPETITORS = (args.competitors || 'competitor1.com,competitor2.com')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const OUT_ROOT = args.outRoot || 'src/prompts';

// SECTION_SEED copied from src/mocks/reportingSeed.js to avoid runtime import issues
const SECTION_SEED = [
  { key: 'global_information', number: '', title: 'GLOBAL INFORMATION' },
  { key: 'products_service', number: '1.1.', title: 'Products/Service' },
  { key: 'target_audience', number: '1.2.', title: 'Target Audience' },
  { key: 'history_market', number: '1.3.', title: 'History & Market' },
  { key: 'unique_selling_point', number: '1.4.', title: 'Unique Selling Point' },
  { key: 'competitors', number: '1.5.', title: 'Competitors' },
  { key: 'brand_nonbrand_keywords', number: '1.6.', title: 'Brand & Non-Brand Keywords' },
  { key: 'social_media', number: '1.7.', title: 'Social Media' },
  { key: 'reviews', number: '1.8.', title: 'Reviews' },
  { key: 'financial_performance', number: '1.9.', title: 'Financial Performance' },
  { key: 'summary', number: '1.10.', title: 'Summary' },
  { key: 'strategic_market_intelligence', number: '', title: 'STRATEGIC MARKET INTELLIGENCE' },
  { key: 'market_position_over_time', number: '2.1.', title: 'Market Position Over Time' },
  { key: 'top_organic_competitors', number: '2.2.', title: 'Top Organic Search Competitors' },
  { key: 'content_gap_ahrefs', number: '2.2.1.', title: 'Organic Search Competitors – Content Gap – Ahrefs' },
  { key: 'top_competitors_similarweb', number: '2.2.2.', title: 'TOP Organic Search Competitors – Similarweb' },
  { key: 'top_competitors_ahrefs', number: '2.2.3.', title: 'TOP Organic Search Competitors – Ahrefs' },
  { key: 'top_competitors_dataforseo', number: '2.2.4.', title: 'TOP Organic Search Competitors – DataforSEO' },
  { key: 'search_competitors_growth', number: '', title: "Search Competitors' Growth in SEO" },
  { key: 'comp_ref_domains', number: '3.1.', title: 'Competitors data – Referring domains' },
  { key: 'comp_domain_rating', number: '3.2.', title: 'Competitors data – Domain Rating' },
  { key: 'comp_avg_org_traffic', number: '3.3.', title: 'Competitors data – Avg. Organic traffic' },
  { key: 'comp_avg_org_traffic_value', number: '3.4.', title: 'Competitors data – Avg. Organic traffic value' },
  { key: 'comp_organic_pages', number: '3.5.', title: 'Competitors data – Organic pages' },
  { key: 'comp_paid_search', number: '3.6.', title: 'Competitors data – Paid Search' },
  { key: 'traffic_overview', number: '', title: 'Traffic Overview' },
  { key: 'industry_dynamics_overview', number: '', title: 'Industry Dynamics Overview' },
  { key: 'brand_sentiment_reviews', number: '', title: 'Brand Sentiment Analysis – Reviews' },
  { key: 'tech_ux_on_site', number: '', title: 'Tech, UX, On-site' },
];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(target, content) {
  ensureDir(path.dirname(target));
  fs.writeFileSync(target, content, 'utf-8');
}

function buildPromptMarkdown(section) {
  const compList = COMPETITORS.join(', ');
  return `# ${section.number ? section.number + ' ' : ''}${section.title}

System:
- You are an expert market analyst. Produce accurate, concise, and well-structured outputs.
- Prefer structured JSON outputs; avoid hallucinations; state assumptions and confidence.

Inputs:
- domain: ${DOMAIN}
- competitors: [${compList}]
- context_file (optional): path to latest scrape/analysis JSON (e.g. sales_intelligence_${DOMAIN}_YYYYMMDD.json)

Task:
- Generate the content for the section "${section.title}" (${section.key}).
- Use any provided context_file if available; otherwise, infer minimally and state assumptions.

Output format (JSON):
{
  "section_key": "${section.key}",
  "section_title": "${section.title}",
  "domain": "${DOMAIN}",
  "content_markdown": "...main narrative...",
  "table_markdown": "| Columna | Valor |\n|---|---|\n...", // optional
  "bullets": ["point 1", "point 2"],
  "assumptions": ["..."],
  "risks": ["..."],
  "next_steps": ["..."],
  "confidence": 0.0
}

Constraints:
- Keep it grounded in evidence; clearly mark estimates.
- Make the section self-contained and ready to render in the UI.
`;
}

function main() {
  const root = path.resolve(process.cwd(), OUT_ROOT);
  ensureDir(root);

  // Write an index file with metadata
  const index = {
    domain: DOMAIN,
    competitors: COMPETITORS,
    sections: SECTION_SEED,
    generated_at: new Date().toISOString(),
  };
  writeFile(path.join(root, 'index.json'), JSON.stringify(index, null, 2));

  // Generate each prompt.md
  for (const s of SECTION_SEED) {
    const dir = path.join(root, s.key);
    ensureDir(dir);
    const promptPath = path.join(dir, 'prompt.md');
    writeFile(promptPath, buildPromptMarkdown(s));
  }

  console.log(`✔ Prompts generated for ${SECTION_SEED.length} sections under ${root}`);
}

main();
