// Dynamic Report Maker
// All data stored locally in localStorage. Export regularly.

(function () {
  const STORAGE_KEY = 'dynamic_report_maker_v1';

  /**
   * Default template per user's spec, in the exact order.
   * Each item has: id, number, title, content, link, attachments: [{name, url}]
   */
  function defaultTemplate() {
    const items = [
      { number: '', title: 'GLOBAL INFORMATION' },
      { number: '1.1.', title: 'Products/Service' },
      { number: '1.2.', title: 'Target Audience' },
      { number: '1.3.', title: 'History & Market' },
      { number: '1.4.', title: 'Unique Selling Point' },
      { number: '1.5.', title: 'Competitors' },
      { number: '1.6.', title: 'Brand & Non-Brand Keywords' },
      { number: '1.7.', title: 'Social Media' },
      { number: '1.8.', title: 'Reviews' },
      { number: '1.9.', title: 'Financial Performance' },
      { number: '1.10.', title: 'Summary' },
      { number: '', title: 'STRATEGIC MARKET INTELLIGENCE' },
      { number: '2.1.', title: 'Market Position Over Time' },
      { number: '2.2.', title: 'Top Organic Search Competitors' },
      { number: '2.2.1.', title: 'Organic Search Competitors – Content Gap – Ahrefs' },
      { number: '2.2.2.', title: 'TOP Organic Search Competitors – Similarweb' },
      { number: '2.2.3.', title: 'TOP Organic Search Competitors – Ahrefs' },
      { number: '2.2.4.', title: 'TOP Organic Search Competitors – DataforSEO' },
      { number: '', title: "Search Competitors' Growth in SEO" },
      { number: '3.1.', title: 'Competitors data – Referring domains' },
      { number: '3.2.', title: 'Competitors data – Domain Rating' },
      { number: '3.3.', title: 'Competitors data – Avg. Organic traffic' },
      { number: '3.4.', title: 'Competitors data – Avg. Organic traffic value' },
      { number: '3.5.', title: 'Competitors data – Organic pages' },
      { number: '3.6.', title: 'Competitors data – Paid Search' },
      { number: '', title: 'Traffic Overview' },
      { number: '', title: 'Industry Dynamics Overview' },
      { number: '', title: 'Brand Sentiment Analysis – Reviews' },
      { number: '', title: 'Tech, UX, On-site' },
    ];

    // Seed attachments example for the specific mentioned file path
    const seeded = items.map((it) => ({
      id: crypto.randomUUID(),
      number: it.number || '',
      title: it.title,
      content: '',
      link: '',
      attachments: [],
    }));

    const reviews = seeded.find((s) => s.title === 'Brand Sentiment Analysis – Reviews');
    if (reviews) {
      reviews.attachments.push({
        name: 'Duolingo.com - Growth Signal Report.pdf',
        url: 'c:\\ForceOfNature\\demo_report\\.windsurf\\workflows\\workflows_respaldo\\BuildTurboApp\\Duolingo.com - Growth Signal Report.pdf',
      });
    }

  // --- Normalized Editor helpers ---
  function validateNormalized(obj) {
    if (!obj || typeof obj !== 'object') return { valid: false, message: 'root is not an object' };
    if (obj.version !== 1) return { valid: false, message: 'version must be 1' };
    if (!Array.isArray(obj.sections)) return { valid: false, message: 'sections must be an array' };
    const required = new Map([
      ['executive_summary', ['bullets']],
      ['traffic_overview', ['total_visits','visits_trend_3m','top_countries','channels_mix','device_split']],
      ['seo_performance', ['keywords_total','keywords_by_intent','top_keywords','backlinks_total','top_ref_domains','top_landing_pages']],
      ['performance_lighthouse', ['performance_score','lcp','cls','inp','best_practices','seo_score']],
      ['competitor_benchmark', ['competitors','positioning_notes']],
      ['growth_plays', ['plays']],
    ]);
    const seen = new Set();
    for (const sec of obj.sections) {
      if (!sec || typeof sec !== 'object') return { valid: false, message: 'section is not an object' };
      if (!sec.id || !required.has(sec.id)) return { valid: false, message: `unexpected or missing section id: ${sec.id}` };
      seen.add(sec.id);
      if (!sec.fields || typeof sec.fields !== 'object') return { valid: false, message: `section ${sec.id} missing fields` };
      for (const key of required.get(sec.id)) {
        if (!(key in sec.fields)) return { valid: false, message: `section ${sec.id} missing field ${key}` };
      }
    }
    for (const id of required.keys()) {
      if (!seen.has(id)) return { valid: false, message: `missing required section ${id}` };
    }
    return { valid: true, message: 'ok' };
  }

  function setNormalizedStatus(msg, ok) {
    if (!normalizedStatus) return;
    normalizedStatus.textContent = msg;
    normalizedStatus.className = 'status ' + (ok ? 'ok' : 'error');
  }

  function initNormalizedEditor() {
    if (!fieldNormalizedJson) return;
    const normalized = buildNormalizedSchema(state.sections);
    fieldNormalizedJson.value = JSON.stringify(normalized, null, 2);
    setNormalizedStatus('Generated from current sections', true);
  }
    return seeded;
  }

  // --- Normalized Schema Export ---
  function buildNormalizedSchema(sections) {
    // Base per normalized_schema.template.yaml
    const out = {
      version: 1,
      sections: [
        {
          id: 'executive_summary',
          title: 'Executive Summary',
          fields: {
            bullets: [], // list[str]
          },
        },
        {
          id: 'traffic_overview',
          title: 'Traffic Overview',
          fields: {
            total_visits: null,
            visits_trend_3m: null,
            top_countries: [],
            channels_mix: [],
            device_split: [],
          },
        },
        {
          id: 'seo_performance',
          title: 'SEO Performance',
          fields: {
            keywords_total: null,
            keywords_by_intent: [],
            top_keywords: [],
            backlinks_total: null,
            top_ref_domains: [],
            top_landing_pages: [],
          },
        },
        {
          id: 'performance_lighthouse',
          title: 'Performance (Lighthouse/Core Web Vitals)',
          fields: {
            performance_score: null,
            lcp: null,
            cls: null,
            inp: null,
            best_practices: null,
            seo_score: null,
          },
        },
        {
          id: 'competitor_benchmark',
          title: 'Competitor Benchmark',
          fields: {
            competitors: [],
            positioning_notes: [],
          },
        },
        {
          id: 'growth_plays',
          title: 'Growth Plays & Recommendations',
          fields: {
            plays: [],
          },
        },
      ],
      metadata: {
        source: 'Dynamic Report Maker',
        generated_at: new Date().toISOString(),
        notes: [],
      },
    };

    // Helper finders by title contains
    const byTitle = (t) => sections.find((s) => (s.title || '').toLowerCase() === t.toLowerCase());
    const byTitleIncludes = (t) => sections.find((s) => (s.title || '').toLowerCase().includes(t.toLowerCase()));

    // Executive Summary → bullets from Summary section (1.10.)
    const summary = byTitle('Summary') || byTitleIncludes('summary');
    if (summary?.content) {
      out.sections.find((s) => s.id === 'executive_summary').fields.bullets = parseBulletsFromText(summary.content);
    }

    // Traffic Overview → map freeform notes; structured fields left null unless patterns found
    const traffic = byTitle('Traffic Overview') || byTitleIncludes('traffic overview');
    if (traffic?.content) {
      const fo = parseTrafficOverview(traffic.content);
      Object.assign(out.sections.find((s) => s.id === 'traffic_overview').fields, fo);
    }

    // SEO Performance → attempt from Brand & Non-Brand Keywords and competitors sections
    const keywordsSec = byTitleIncludes('brand & non-brand keywords') || byTitleIncludes('keywords');
    if (keywordsSec?.content) {
      const seoFields = out.sections.find((s) => s.id === 'seo_performance').fields;
      const parsed = parseSeoFromText(keywordsSec.content);
      Object.assign(seoFields, parsed);
    }

    // Competitor benchmark → from Top Organic Search Competitors and related sections
    const compTitles = [
      'Top Organic Search Competitors',
      'Organic Search Competitors – Content Gap – Ahrefs',
      'TOP Organic Search Competitors – Similarweb',
      'TOP Organic Search Competitors – Ahrefs',
      'TOP Organic Search Competitors – DataforSEO',
    ];
    const competitorNotes = [];
    const competitors = [];
    compTitles.forEach((t) => {
      const sec = byTitle(t) || byTitleIncludes(t.toLowerCase());
      if (sec?.content) {
        const { list, notes } = parseCompetitorsFromText(sec.content);
        competitors.push(...list);
        competitorNotes.push(...notes);
      }
    });
    const compFields = out.sections.find((s) => s.id === 'competitor_benchmark').fields;
    compFields.competitors = mergeCompetitors(competitors);
    compFields.positioning_notes = dedupeStrings(competitorNotes);

    // Growth plays → from Tech, UX, On-site and Summary recommendations if any
    const growthSec = byTitle('Tech, UX, On-site') || byTitleIncludes('tech, ux');
    if (growthSec?.content) {
      const plays = parsePlaysFromText(growthSec.content);
      out.sections.find((s) => s.id === 'growth_plays').fields.plays = plays;
    }

    return out;
  }

  function parseBulletsFromText(text) {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const bullets = [];
    lines.forEach((l) => {
      const m = l.match(/^[-*•]\s*(.+)$/);
      if (m) bullets.push(m[1]);
    });
    // If no bullet markers, take first 4–8 sentences heuristically
    if (!bullets.length) {
      const sentences = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
      bullets.push(...sentences.slice(0, 6));
    }
    return bullets;
  }

  function parseTrafficOverview(text) {
    const fields = {
      total_visits: null,
      visits_trend_3m: null,
      top_countries: [],
      channels_mix: [],
      device_split: [],
    };
    // Try naive patterns like: Total visits: 1.2M, Visits trend 3m: +12%
    const tv = text.match(/total\s+visits\s*[:|-]\s*([\d.,]+)\s*([kmb]?)/i);
    if (tv) fields.total_visits = toNumberWithSuffix(tv[1], tv[2]);
    const vt = text.match(/(visits|traffic)\s*trend\s*\(?3m\)?\s*[:|-]\s*([+\-]?[\d.]+)\s*%/i);
    if (vt) fields.visits_trend_3m = parseFloat(vt[2]);
    return fields;
  }

  function parseSeoFromText(text) {
    const fields = {
      keywords_total: null,
      keywords_by_intent: [],
      top_keywords: [],
      backlinks_total: null,
      top_ref_domains: [],
      top_landing_pages: [],
    };
    const kw = text.match(/keywords?\s*[:|-]\s*([\d.,]+)/i);
    if (kw) fields.keywords_total = parseFloat(kw[1].replace(/[,]/g, '')); 
    const bl = text.match(/backlinks?\s*[:|-]\s*([\d.,]+)/i);
    if (bl) fields.backlinks_total = parseFloat(bl[1].replace(/[,]/g, ''));
    // Extract top keywords as lines starting with '-' or '*'
    const lines = text.split(/\r?\n/);
    lines.forEach((l) => {
      const m = l.match(/^[-*]\s*(.+)$/);
      if (m) {
        fields.top_keywords.push({ keyword: m[1], pos: null, 'traffic_share_%': null });
      }
    });
    return fields;
  }

  function parseCompetitorsFromText(text) {
    const list = [];
    const notes = [];
    const lines = text.split(/\r?\n/);
    lines.forEach((l) => {
      const m = l.match(/^[-*]\s*([^\s]+)(?:\s*[-–—:]\s*(.+))?$/); // "- domain.com - note"
      if (m) {
        list.push({
          domain: (m[1] || '').trim(),
          total_visits: null,
          seo_keywords: null,
          performance_score: null,
          notes: m[2] ? m[2].trim() : undefined,
        });
        if (m[2]) notes.push(m[2].trim());
      }
    });
    return { list, notes };
  }

  function mergeCompetitors(arr) {
    const map = new Map();
    arr.forEach((c) => {
      const key = (c.domain || '').toLowerCase();
      if (!key) return;
      const prev = map.get(key) || { domain: c.domain, total_visits: null, seo_keywords: null, performance_score: null, notes: '' };
      const notes = [prev.notes, c.notes].filter(Boolean).join(' | ');
      map.set(key, { ...prev, ...c, notes });
    });
    return Array.from(map.values());
  }

  function dedupeStrings(arr) {
    const set = new Set(arr.map((s) => s.trim()).filter(Boolean));
    return Array.from(set.values());
  }

  function parsePlaysFromText(text) {
    // Expect list items like: - Improve LCP on homepage — rationale ...
    const plays = [];
    const lines = text.split(/\r?\n/);
    lines.forEach((l) => {
      const m = l.match(/^[-*]\s*(.+)$/);
      if (m) {
        plays.push({ title: m[1], rationale: '', expected_impact: '', implementation: [], evidence: [] });
      }
    });
    if (!plays.length && text.trim()) {
      plays.push({ title: text.trim().slice(0, 80) + (text.trim().length > 80 ? '…' : ''), rationale: '', expected_impact: '', implementation: [], evidence: [] });
    }
    return plays;
  }

  function toNumberWithSuffix(numStr, suf) {
    const n = parseFloat(numStr.replace(/[,]/g, ''));
    const s = (suf || '').toLowerCase();
    if (s === 'k') return Math.round(n * 1e3);
    if (s === 'm') return Math.round(n * 1e6);
    if (s === 'b') return Math.round(n * 1e9);
    return isNaN(n) ? null : n;
  }

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sections: defaultTemplate(), selectedId: null };
    try {
      const data = JSON.parse(raw);
      // ensure ids
      data.sections = (data.sections || []).map((s) => ({
        id: s.id || crypto.randomUUID(),
        number: s.number || '',
        title: s.title || '',
        content: s.content || '',
        link: s.link || '',
        attachments: Array.isArray(s.attachments) ? s.attachments : [],
      }));
      return { sections: data.sections, selectedId: data.selectedId || (data.sections[0]?.id ?? null) };
    } catch (e) {
      console.warn('Failed to parse saved state. Resetting to default.', e);
      return { sections: defaultTemplate(), selectedId: null };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sections: state.sections, selectedId: state.selectedId }));
  }

  // DOM refs
  const listEl = document.getElementById('sections-list');
  const fieldNumber = document.getElementById('field-number');
  const fieldTitle = document.getElementById('field-title');
  const fieldContent = document.getElementById('field-content');
  const fieldLink = document.getElementById('field-link');
  const attachmentsList = document.getElementById('attachments-list');
  const btnAddAttachment = document.getElementById('btn-add-attachment');
  const btnApply = document.getElementById('btn-apply');
  const btnSave = document.getElementById('btn-save');
  const btnExportMd = document.getElementById('btn-export-md');
  const btnCopyMd = document.getElementById('btn-copy-md');
  const btnExportPdf = document.getElementById('btn-export-pdf');
  const btnExportNormalized = document.getElementById('btn-export-normalized');
  const btnExportJson = document.getElementById('btn-export-json');
  const inputImportJson = document.getElementById('input-import-json');
  const btnReset = document.getElementById('btn-reset');

  const editorTitle = document.getElementById('editor-title');
  const printRoot = document.getElementById('print-root');

  // Normalized editor DOM
  const fieldNormalizedJson = document.getElementById('field-normalized-json');
  const btnGenNormalized = document.getElementById('btn-gen-normalized');
  const btnValidateNormalized = document.getElementById('btn-validate-normalized');
  const chkUseEdited = document.getElementById('chk-use-edited');
  const normalizedStatus = document.getElementById('normalized-status');

  let state = loadState();

  // Render sidebar list
  function renderList() {
    listEl.innerHTML = '';
    state.sections.forEach((s) => {
      const li = document.createElement('li');
      li.setAttribute('draggable', 'true');
      li.dataset.id = s.id;
      li.addEventListener('dragstart', onDragStart);
      li.addEventListener('dragover', onDragOver);
      li.addEventListener('drop', onDrop);
      li.addEventListener('dragend', onDragEnd);
      li.addEventListener('click', () => selectSection(s.id));
      if (state.selectedId === s.id) li.classList.add('active');

      const grab = document.createElement('span');
      grab.className = 'grab';
      grab.textContent = '⋮⋮';

      const meta = document.createElement('div');
      meta.className = 'meta';
      const num = document.createElement('span');
      num.className = 'num';
      num.textContent = s.number;
      const title = document.createElement('span');
      title.className = 'title';
      title.textContent = s.title;

      meta.appendChild(num);
      meta.appendChild(title);
      li.appendChild(grab);
      li.appendChild(meta);
      listEl.appendChild(li);
    });
  }

  function selectSection(id) {
    state.selectedId = id;
    saveState();
    renderList();
    renderEditor();
  }

  function currentSection() {
    return state.sections.find((s) => s.id === state.selectedId) || state.sections[0];
  }

  function renderEditor() {
    const s = currentSection();
    if (!s) return;
    editorTitle.textContent = `Edit Section — ${s.number} ${s.title}`.trim();
    fieldNumber.value = s.number || '';
    fieldTitle.value = s.title || '';
    fieldContent.value = s.content || '';
    fieldLink.value = s.link || '';

    // render attachments
    attachmentsList.innerHTML = '';
    (s.attachments || []).forEach((att, idx) => {
      const li = document.createElement('li');
      const inputName = document.createElement('input');
      inputName.type = 'text';
      inputName.placeholder = 'Attachment name';
      inputName.value = att.name || '';
      inputName.addEventListener('input', () => {
        att.name = inputName.value;
        saveState();
      });

      const inputUrl = document.createElement('input');
      inputUrl.type = 'text';
      inputUrl.placeholder = 'Attachment URL or file path';
      inputUrl.value = att.url || '';
      inputUrl.addEventListener('input', () => {
        att.url = inputUrl.value;
        saveState();
      });

      const btnRemove = document.createElement('button');
      btnRemove.textContent = 'Remove';
      btnRemove.addEventListener('click', () => {
        s.attachments.splice(idx, 1);
        saveState();
        renderEditor();
      });

      li.appendChild(inputName);
      li.appendChild(inputUrl);
      li.appendChild(btnRemove);
      attachmentsList.appendChild(li);
    });
  }

  btnAddAttachment.addEventListener('click', () => {
    const s = currentSection();
    if (!s.attachments) s.attachments = [];
    s.attachments.push({ name: '', url: '' });
    saveState();
    renderEditor();
  });

  btnApply.addEventListener('click', () => {
    const s = currentSection();
    if (!s) return;
    s.number = fieldNumber.value.trim();
    s.title = fieldTitle.value.trim();
    s.content = fieldContent.value;
    s.link = fieldLink.value.trim();
    saveState();
    renderList();
    renderEditor();
  });

  btnSave.addEventListener('click', () => {
    saveState();
    flash('Saved to localStorage.');
  });

  btnExportJson.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ sections: state.sections }, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'report.json');
  });

  inputImportJson.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.sections)) throw new Error('Invalid JSON: missing sections array');
        state.sections = data.sections.map((s) => ({
          id: s.id || crypto.randomUUID(),
          number: s.number || '',
          title: s.title || '',
          content: s.content || '',
          link: s.link || '',
          attachments: Array.isArray(s.attachments) ? s.attachments : [],
        }));
        state.selectedId = state.sections[0]?.id ?? null;
        saveState();
        renderList();
        renderEditor();
        flash('Imported JSON successfully.');
      } catch (err) {
        alert('Failed to import JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    // Reset input value so the same file re-triggers change next time
    e.target.value = '';
  });

  btnExportMd.addEventListener('click', () => {
    const md = exportMarkdown(state.sections);
    const blob = new Blob([md], { type: 'text/markdown' });
    downloadBlob(blob, 'report.md');
  });

  btnCopyMd.addEventListener('click', async () => {
    const md = exportMarkdown(state.sections);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(md);
      } else {
        // Fallback: use a temporary textarea
        const ta = document.createElement('textarea');
        ta.value = md;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      flash('Markdown copied to clipboard');
    } catch (err) {
      alert('Failed to copy Markdown: ' + err.message);
    }
  });

  // Build a print-friendly document and open the print dialog for PDF export
  btnExportPdf.addEventListener('click', () => {
    buildPrintDocument(state.sections);
    // Allow the DOM to render before printing
    requestAnimationFrame(() => {
      window.print();
      // Optionally clear after print
      setTimeout(() => { printRoot.innerHTML = ''; }, 500);
    });
  });

  // Export JSON that conforms to src/tools/pdf_blueprints/templates/normalized_schema.template.yaml
  btnExportNormalized.addEventListener('click', () => {
    let data;
    if (chkUseEdited && chkUseEdited.checked && fieldNormalizedJson && fieldNormalizedJson.value.trim()) {
      try {
        const parsed = JSON.parse(fieldNormalizedJson.value);
        const { valid, message } = validateNormalized(parsed);
        if (!valid) {
          flash('Edited normalized JSON invalid: ' + message + ' — regenerating instead');
          data = buildNormalizedSchema(state.sections);
        } else {
          data = parsed;
        }
      } catch (e) {
        flash('Edited normalized JSON parse error — regenerating');
        data = buildNormalizedSchema(state.sections);
      }
    } else {
      data = buildNormalizedSchema(state.sections);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'report.normalized.json');
  });

  // Bind actions for the Normalized Editor
  if (btnGenNormalized) {
    btnGenNormalized.addEventListener('click', () => {
      const normalized = buildNormalizedSchema(state.sections);
      if (fieldNormalizedJson) fieldNormalizedJson.value = JSON.stringify(normalized, null, 2);
      setNormalizedStatus('Regenerated from sections', true);
    });
  }

  if (btnValidateNormalized) {
    btnValidateNormalized.addEventListener('click', () => {
      try {
        const parsed = JSON.parse(fieldNormalizedJson.value);
        const { valid, message } = validateNormalized(parsed);
        setNormalizedStatus(valid ? 'Valid ✓' : 'Invalid: ' + message, valid);
      } catch (e) {
        setNormalizedStatus('Parse error: ' + e.message, false);
      }
    });
  }

  btnReset.addEventListener('click', () => {
    if (!confirm('Reset to default template? This will replace the current in-memory report (you can re-import JSON if needed).')) return;
    state.sections = defaultTemplate();
    state.selectedId = state.sections[0]?.id ?? null;
    saveState();
    renderList();
    renderEditor();
  });

  function exportMarkdown(sections) {
    const lines = [];
    sections.forEach((s) => {
      const header = (s.number ? `${s.number} ` : '') + s.title;
      const level = inferHeaderLevel(s.number);
      lines.push('#'.repeat(level) + ' ' + header);
      lines.push('');
      if (s.content && s.content.trim()) {
        lines.push(s.content.trim());
        lines.push('');
      }
      if ((s.attachments && s.attachments.length) || (s.link && s.link.trim())) {
        lines.push('Attachments:');
        if (s.link && s.link.trim()) {
          lines.push(`- Main reference: ${s.link.trim()}`);
        }
        (s.attachments || []).forEach((att) => {
          const name = att.name ? att.name : 'Attachment';
          const url = att.url ? att.url : '';
          // Avoid nested template literals for compatibility
          lines.push(`- ${name}${url ? ' — ' + url : ''}`);
        });
        lines.push('');
      }
    });
    return lines.join('\n');
  }

  function inferHeaderLevel(number) {
    if (!number) return 2; // top-level named section without explicit number
    // Count dots in something like '2.2.1.' -> depth 3
    const depth = (number.match(/\./g) || []).length;
    // Map depth to header level: 1 -> h2, 2 -> h3, 3 -> h4, else h5
    return Math.min(1 + depth, 5);
  }

  function headingTagForLevel(level) {
    if (level <= 2) return 'h2';
    if (level === 3) return 'h3';
    if (level === 4) return 'h4';
    return 'h5';
  }

  function buildPrintDocument(sections) {
    printRoot.innerHTML = '';

    // Optional title for the printed report
    const title = document.createElement('h1');
    title.className = 'page-title';
    title.textContent = 'Report';
    printRoot.appendChild(title);

    let firstMajorPrinted = false;
    sections.forEach((s) => {
      const level = inferHeaderLevel(s.number);
      const tag = headingTagForLevel(level);
      const sectionDiv = document.createElement('div');
      sectionDiv.className = 'section';

      // Add page break before major sections (h2), except the first one
      if (tag === 'h2') {
        if (firstMajorPrinted) sectionDiv.classList.add('page-break-before');
        firstMajorPrinted = true;
      }

      const headerEl = document.createElement(tag);
      headerEl.textContent = `${s.number ? s.number + ' ' : ''}${s.title}`.trim();
      sectionDiv.appendChild(headerEl);

      if (s.content && s.content.trim()) {
        const p = document.createElement('div');
        p.className = 'content';
        p.textContent = s.content;
        sectionDiv.appendChild(p);
      }

      if ((s.attachments && s.attachments.length) || (s.link && s.link.trim())) {
        const attDiv = document.createElement('div');
        attDiv.className = 'attachments';
        const h4 = document.createElement('h4');
        h4.textContent = 'Attachments';
        attDiv.appendChild(h4);
        const ul = document.createElement('ul');
        if (s.link && s.link.trim()) {
          const li = document.createElement('li');
          li.textContent = `Main reference: ${s.link.trim()}`;
          ul.appendChild(li);
        }
        (s.attachments || []).forEach((att) => {
          const li = document.createElement('li');
          const name = att.name ? att.name : 'Attachment';
          const url = att.url ? ` — ${att.url}` : '';
          li.textContent = name + url;
          ul.appendChild(li);
        });
        attDiv.appendChild(ul);
        sectionDiv.appendChild(attDiv);
      }

      printRoot.appendChild(sectionDiv);
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Simple flash message
  let flashTimer = null;
  function flash(msg) {
    let div = document.getElementById('flash');
    if (!div) {
      div = document.createElement('div');
      div.id = 'flash';
      div.style.position = 'fixed';
      div.style.bottom = '16px';
      div.style.right = '16px';
      div.style.padding = '10px 12px';
      div.style.background = '#111827';
      div.style.color = '#f9fafb';
      div.style.borderRadius = '8px';
      div.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
      document.body.appendChild(div);
    }
    div.textContent = msg;
    div.style.opacity = '1';
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => { div.style.opacity = '0'; }, 1800);
  }

  // Drag & Drop
  let dragId = null;
  function onDragStart(e) {
    dragId = this.dataset.id;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  }
  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
  function onDrop(e) {
    e.preventDefault();
    const targetId = this.dataset.id;
    if (!dragId || dragId === targetId) return;
    const fromIdx = state.sections.findIndex((s) => s.id === dragId);
    const toIdx = state.sections.findIndex((s) => s.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = state.sections.splice(fromIdx, 1);
    state.sections.splice(toIdx, 0, moved);
    saveState();
    renderList();
  }
  function onDragEnd() {
    this.classList.remove('dragging');
    dragId = null;
  }

  // Initialize
  if (!state.selectedId && state.sections.length) {
    state.selectedId = state.sections[0].id;
  }
  renderList();
  renderEditor();
  initNormalizedEditor();
})();
