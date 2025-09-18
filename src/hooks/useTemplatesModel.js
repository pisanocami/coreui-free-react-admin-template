import { useEffect, useMemo, useState } from 'react'
import { SECTION_SEED } from '../mocks/reportingSeed'

const STORAGE_V1 = 'dynamic_report_maker_v1'
const STORAGE_V2 = 'dynamic_report_maker_v2'

// Catalog seed from mocks — stable IDs equal to the section key
function seedCatalog() {
  return SECTION_SEED.map((s) => ({
    id: s.key,
    key: s.key,
    defaultNumber: s.number || '',
    defaultTitle: s.title,
  }))
}

function buildDefaultTemplateFromCatalog(catalog) {
  // Use a sensible default order (all catalog items as provided)
  return {
    id: crypto.randomUUID(),
    name: 'Default',
    sectionIds: catalog.map((s) => s.id),
  }
}

function migrateFromV1() {
  try {
    const raw = localStorage.getItem(STORAGE_V1)
    if (!raw) return null
    const data = JSON.parse(raw)
    const sectionsArr = Array.isArray(data.sections) ? data.sections : []
    // Create catalog by titles in order (stable ID = generated key)
    const catalog = []
    const sectionIdByTitle = new Map()
    sectionsArr.forEach((s) => {
      const title = s.title || 'Untitled'
      if (!sectionIdByTitle.has(title)) {
        const key = title.toLowerCase().replace(/[^a-z0-9]+/g, '_')
        const id = key
        sectionIdByTitle.set(title, id)
        catalog.push({ id, key, defaultNumber: s.number || '', defaultTitle: title })
      }
    })
    const template = {
      id: crypto.randomUUID(),
      name: 'Migrated',
      sectionIds: sectionsArr.map((s) => sectionIdByTitle.get(s.title || 'Untitled')).filter(Boolean),
    }
    const report = {
      id: crypto.randomUUID(),
      templateId: template.id,
      name: 'Migrated Report',
      sections: sectionsArr.map((s) => ({
        sectionId: sectionIdByTitle.get(s.title || 'Untitled'),
        number: s.number || '',
        title: s.title || '',
        content: s.content || '',
        link: s.link || '',
        attachments: Array.isArray(s.attachments) ? s.attachments : [],
      })),
      updatedAt: new Date().toISOString(),
    }
    return {
      version: 2,
      sections: Object.fromEntries(catalog.map((s) => [s.id, s])),
      templates: [template],
      reports: [report],
      currentTemplateId: template.id,
      currentReportId: report.id,
    }
  } catch {
    return null
  }
}

export function useTemplatesModel() {
  const [state, setState] = useState(() => {
    // Try V2
    const rawV2 = localStorage.getItem(STORAGE_V2)
    if (rawV2) {
      try {
        const parsed = JSON.parse(rawV2)
        return parsed
      } catch {}
    }
    // Try migrate V1
    const migrated = migrateFromV1()
    if (migrated) {
      localStorage.setItem(STORAGE_V2, JSON.stringify(migrated))
      return migrated
    }
    // Fresh init
    const catalog = seedCatalog()
    const defaultTemplate = buildDefaultTemplateFromCatalog(catalog)
    const initial = {
      version: 2,
      sections: Object.fromEntries(catalog.map((s) => [s.id, s])),
      templates: [defaultTemplate],
      reports: [],
      currentTemplateId: defaultTemplate.id,
      currentReportId: null,
    }
    localStorage.setItem(STORAGE_V2, JSON.stringify(initial))
    return initial
  })

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_V2, JSON.stringify(state))
  }, [state])

  // Derived
  const templates = state.templates
  const sectionsCatalog = state.sections
  const reports = state.reports
  const currentTemplate = useMemo(() => templates.find((t) => t.id === state.currentTemplateId) || templates[0], [templates, state.currentTemplateId])
  const currentReport = useMemo(() => reports.find((r) => r.id === state.currentReportId) || null, [reports, state.currentReportId])

  // Helpers
  const setCurrentTemplate = (id) => setState((prev) => ({ ...prev, currentTemplateId: id }))
  const setCurrentReport = (id) => setState((prev) => ({ ...prev, currentReportId: id }))

  // Templates API
  function createTemplate(name = 'Nuevo template') {
    setState((prev) => {
      const t = { id: crypto.randomUUID(), name, sectionIds: Object.keys(prev.sections) }
      return { ...prev, templates: [...prev.templates, t], currentTemplateId: t.id }
    })
  }
  function renameTemplate(id, name) {
    setState((prev) => ({ ...prev, templates: prev.templates.map((t) => (t.id === id ? { ...t, name } : t)) }))
  }
  function deleteTemplate(id) {
    setState((prev) => {
      const templates = prev.templates.filter((t) => t.id !== id)
      const nextTemplateId = templates[0]?.id || null
      const reports = prev.reports.filter((r) => r.templateId !== id)
      const nextReportId = reports.find((r) => r.templateId === nextTemplateId)?.id || null
      return { ...prev, templates, currentTemplateId: nextTemplateId, reports, currentReportId: nextReportId }
    })
  }
  function duplicateTemplate(id) {
    setState((prev) => {
      const src = prev.templates.find((t) => t.id === id)
      if (!src) return prev
      const clone = { id: crypto.randomUUID(), name: `${src.name} (copy)`, sectionIds: [...src.sectionIds] }
      return { ...prev, templates: [...prev.templates, clone], currentTemplateId: clone.id }
    })
  }
  function addSectionToTemplate(templateId, sectionId, index = null) {
    setState((prev) => {
      const templates = prev.templates.map((t) => {
        if (t.id !== templateId) return t
        const arr = [...t.sectionIds]
        if (index === null || index === undefined) arr.push(sectionId)
        else arr.splice(index, 0, sectionId)
        return { ...t, sectionIds: arr }
      })
      return { ...prev, templates }
    })
  }
  function removeSectionFromTemplate(templateId, sectionId) {
    setState((prev) => ({
      ...prev,
      templates: prev.templates.map((t) => (t.id === templateId ? { ...t, sectionIds: t.sectionIds.filter((id) => id !== sectionId) } : t)),
    }))
  }
  function reorderTemplateSections(templateId, fromIdx, toIdx) {
    setState((prev) => ({
      ...prev,
      templates: prev.templates.map((t) => {
        if (t.id !== templateId) return t
        const arr = [...t.sectionIds]
        const [m] = arr.splice(fromIdx, 1)
        arr.splice(toIdx, 0, m)
        return { ...t, sectionIds: arr }
      }),
    }))
  }

  // Sections Catalog API
  function createSection({ key, defaultNumber = '', defaultTitle = 'Untitled' }) {
    const id = crypto.randomUUID()
    setState((prev) => ({
      ...prev,
      sections: { ...prev.sections, [id]: { id, key: key || defaultTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_'), defaultNumber, defaultTitle } },
    }))
    return id
  }
  function updateSection(sectionId, patch) {
    setState((prev) => ({ ...prev, sections: { ...prev.sections, [sectionId]: { ...prev.sections[sectionId], ...patch } } }))
  }
  function deleteSection(sectionId) {
    setState((prev) => {
      const { [sectionId]: _, ...rest } = prev.sections
      return {
        ...prev,
        sections: rest,
        templates: prev.templates.map((t) => ({ ...t, sectionIds: t.sectionIds.filter((id) => id !== sectionId) })),
      }
    })
  }

  // Reports API
  function createReport(templateId, name = 'Nuevo reporte') {
    setState((prev) => {
      const template = prev.templates.find((t) => t.id === templateId) || prev.templates[0]
      if (!template) return prev
      const sections = template.sectionIds.map((sid) => {
        const cat = prev.sections[sid]
        return {
          sectionId: sid,
          number: cat?.defaultNumber || '',
          title: cat?.defaultTitle || '',
          content: '',
          link: '',
          attachments: [],
        }
      })
      const rep = { id: crypto.randomUUID(), templateId: template.id, name, sections, updatedAt: new Date().toISOString() }
      return { ...prev, reports: [...prev.reports, rep], currentTemplateId: template.id, currentReportId: rep.id }
    })
  }
  function renameReport(id, name) {
    setState((prev) => ({ ...prev, reports: prev.reports.map((r) => (r.id === id ? { ...r, name } : r)) }))
  }
  function deleteReport(id) {
    setState((prev) => {
      const reports = prev.reports.filter((r) => r.id !== id)
      const next = reports.find((r) => r.templateId === prev.currentTemplateId) || reports[0] || null
      return { ...prev, reports, currentReportId: next?.id || null }
    })
  }
  function duplicateReport(id) {
    setState((prev) => {
      const src = prev.reports.find((r) => r.id === id)
      if (!src) return prev
      const clone = { ...src, id: crypto.randomUUID(), name: `${src.name} (copy)`, updatedAt: new Date().toISOString() }
      return { ...prev, reports: [...prev.reports, clone], currentReportId: clone.id }
    })
  }
  function selectReport(id) {
    setCurrentReport(id)
  }
  function updateReportSection(reportId, sectionIdx, patch) {
    setState((prev) => ({
      ...prev,
      reports: prev.reports.map((r) => {
        if (r.id !== reportId) return r
        const list = [...r.sections]
        list[sectionIdx] = { ...list[sectionIdx], ...patch }
        return { ...r, sections: list, updatedAt: new Date().toISOString() }
      }),
    }))
  }
  function reorderReportSections(reportId, fromIdx, toIdx) {
    setState((prev) => ({
      ...prev,
      reports: prev.reports.map((r) => {
        if (r.id !== reportId) return r
        const arr = [...r.sections]
        const [m] = arr.splice(fromIdx, 1)
        arr.splice(toIdx, 0, m)
        return { ...r, sections: arr, updatedAt: new Date().toISOString() }
      }),
    }))
  }

  return {
    state,
    templates,
    sectionsCatalog,
    reports,
    currentTemplate,
    currentReport,
    currentTemplateId: state.currentTemplateId,
    currentReportId: state.currentReportId,
    setCurrentTemplate,
    setCurrentReport,

    // Templates
    createTemplate,
    renameTemplate,
    deleteTemplate,
    duplicateTemplate,
    addSectionToTemplate,
    removeSectionFromTemplate,
    reorderTemplateSections,

    // Sections
    createSection,
    updateSection,
    deleteSection,

    // Reports
    createReport,
    renameReport,
    deleteReport,
    duplicateReport,
    selectReport,
    updateReportSection,
    reorderReportSections,
  }
}
