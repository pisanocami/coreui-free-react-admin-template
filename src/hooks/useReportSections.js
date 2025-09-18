import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'dynamic_report_maker_v1'

function seedTemplate() {
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
  ]
  const seeded = items.map((it) => ({
    id: crypto.randomUUID(),
    number: it.number || '',
    title: it.title,
    content: '',
    link: '',
    attachments: [],
  }))
  // Seed sample attachment under Reviews, as in the example
  const reviews = seeded.find((s) => s.title === 'Brand Sentiment Analysis – Reviews')
  if (reviews) {
    reviews.attachments.push({
      name: 'Duolingo.com - Growth Signal Report.pdf',
      url: 'c://ForceOfNature//demo_report//.windsurf//workflows//workflows_respaldo//BuildTurboApp//Duolingo.com - Growth Signal Report.pdf',
    })
  }
  return seeded
}

export function useReportSections() {
  const [templates, setTemplates] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const defaultTemplate = { id: crypto.randomUUID(), name: 'Default', sections: seedTemplate() }
        return { templates: [defaultTemplate], currentTemplateId: defaultTemplate.id }
      }
      const data = JSON.parse(raw)
      // Backward compatibility: older structure with { sections }
      if (Array.isArray(data.sections)) {
        const migrated = {
          templates: [
            {
              id: crypto.randomUUID(),
              name: 'Migrated',
              sections: data.sections.map((s) => ({
                id: s.id || crypto.randomUUID(),
                number: s.number || '',
                title: s.title || '',
                content: s.content || '',
                link: s.link || '',
                attachments: Array.isArray(s.attachments) ? s.attachments : [],
              })),
            },
          ],
          currentTemplateId: null,
        }
        migrated.currentTemplateId = migrated.templates[0].id
        return migrated
      }
      // New structure { templates: [], currentTemplateId }
      const safeTemplates = (Array.isArray(data.templates) ? data.templates : []).map((t) => ({
        id: t.id || crypto.randomUUID(),
        name: t.name || 'Sin nombre',
        sections: (Array.isArray(t.sections) ? t.sections : []).map((s) => ({
          id: s.id || crypto.randomUUID(),
          number: s.number || '',
          title: s.title || '',
          content: s.content || '',
          link: s.link || '',
          attachments: Array.isArray(s.attachments) ? s.attachments : [],
        })),
      }))
      let currentId = data.currentTemplateId || safeTemplates[0]?.id || null
      if (!currentId && safeTemplates.length) currentId = safeTemplates[0].id
      if (!safeTemplates.length) {
        const def = { id: crypto.randomUUID(), name: 'Default', sections: seedTemplate() }
        return { templates: [def], currentTemplateId: def.id }
      }
      return { templates: safeTemplates, currentTemplateId: currentId }
    } catch {
      const def = { id: crypto.randomUUID(), name: 'Default', sections: seedTemplate() }
      return { templates: [def], currentTemplateId: def.id }
    }
  })

  const currentTemplate = useMemo(
    () => templates.templates.find((t) => t.id === templates.currentTemplateId) || templates.templates[0],
    [templates],
  )

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
  }, [templates])

  // Sections API (scoped to current template)
  const sections = currentTemplate ? currentTemplate.sections : []
  const setSections = (updater) => {
    setTemplates((prev) => {
      const list = prev.templates.map((t) => {
        if (t.id !== prev.currentTemplateId) return t
        const nextSections = typeof updater === 'function' ? updater(t.sections) : updater
        return { ...t, sections: nextSections }
      })
      return { ...prev, templates: list }
    })
  }

  const api = useMemo(
    () => ({
      // Template management
      createTemplate(name = 'Nuevo template') {
        const tmpl = { id: crypto.randomUUID(), name, sections: seedTemplate() }
        setTemplates((prev) => ({
          templates: [...prev.templates, tmpl],
          currentTemplateId: tmpl.id,
        }))
      },
      selectTemplate(id) {
        setTemplates((prev) => ({ ...prev, currentTemplateId: id }))
      },
      renameTemplate(id, name) {
        setTemplates((prev) => ({
          ...prev,
          templates: prev.templates.map((t) => (t.id === id ? { ...t, name } : t)),
        }))
      },
      deleteTemplate(id) {
        setTemplates((prev) => {
          const filtered = prev.templates.filter((t) => t.id !== id)
          const nextId = filtered[0]?.id || null
          return { templates: filtered, currentTemplateId: nextId }
        })
      },
      duplicateTemplate(id) {
        setTemplates((prev) => {
          const src = prev.templates.find((t) => t.id === id)
          if (!src) return prev
          const clone = {
            id: crypto.randomUUID(),
            name: `${src.name} (copy)`,
            sections: src.sections.map((s) => ({ ...s, id: crypto.randomUUID() })),
          }
          return { templates: [...prev.templates, clone], currentTemplateId: clone.id }
        })
      },

      // Sections ops
      updateSection(id, patch) {
        setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
      },
      moveBefore(sourceId, targetId) {
        setSections((prev) => {
          const list = [...prev]
          const fromIdx = list.findIndex((s) => s.id === sourceId)
          const toIdx = list.findIndex((s) => s.id === targetId)
          if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return prev
          const [moved] = list.splice(fromIdx, 1)
          list.splice(toIdx, 0, moved)
          return list
        })
      },
      moveBy(id, delta) {
        setSections((prev) => {
          const list = [...prev]
          const idx = list.findIndex((s) => s.id === id)
          if (idx < 0) return prev
          const newIdx = Math.max(0, Math.min(list.length - 1, idx + delta))
          if (newIdx === idx) return prev
          const [moved] = list.splice(idx, 1)
          list.splice(newIdx, 0, moved)
          return list
        })
      },
      addAttachment(id) {
        setSections((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, attachments: [...(s.attachments || []), { name: '', url: '' }] } : s,
          ),
        )
      },
      updateAttachment(id, idx, patch) {
        setSections((prev) =>
          prev.map((s) => {
            if (s.id !== id) return s
            const atts = [...(s.attachments || [])]
            atts[idx] = { ...atts[idx], ...patch }
            return { ...s, attachments: atts }
          }),
        )
      },
      removeAttachment(id, idx) {
        setSections((prev) =>
          prev.map((s) => {
            if (s.id !== id) return s
            const atts = [...(s.attachments || [])]
            atts.splice(idx, 1)
            return { ...s, attachments: atts }
          }),
        )
      },
      reset() {
        setSections(seedTemplate())
      },
    }), [])

  return {
    // templates/state
    templates: templates.templates,
    currentTemplateId: templates.currentTemplateId,
    currentTemplate,
    // sections API (scoped to current template)
    sections,
    setSections,
    ...api,
  }
}
