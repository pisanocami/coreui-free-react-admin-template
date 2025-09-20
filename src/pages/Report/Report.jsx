import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CListGroup,
  CListGroupItem,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CButton,
  CInputGroup,
  CInputGroupText,
  CButtonGroup,
  CFormSelect,
  CAlert,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { freeSet } from '@coreui/icons'
import { useTemplatesModel } from '../../hooks/useTemplatesModel'
import { useParams, Link } from 'react-router-dom'

// Eagerly import any local prompt markdowns so we can lookup by section key.
// This is optional and only works if you have run tools/generate-prompts.mjs
// to create files under /src/prompts/{key}/prompt.md
// Vite will inline these contents at build-time.
import { duolingoMockData, calvinkleinMockData } from '../../mock-report-data.js'

// Temporary fix: Define PROMPT_FILES as empty object until build-time generation is implemented
const PROMPT_FILES = {}

const Report = () => {
  const {
    // state
    templates,
    sectionsCatalog,
    reports,
    currentTemplate,
    currentTemplateId,
    currentReport,
    currentReportId,
    // template APIs
    createTemplate,
    setCurrentTemplate,
    renameTemplate,
    deleteTemplate,
    duplicateTemplate,
    // reports APIs
    createReport,
    renameReport,
    deleteReport,
    duplicateReport,
    selectReport,
    updateReportSection,
    reorderReportSections,
  } = useTemplatesModel()
  const { templateId, reportId } = useParams()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const draggingIdRef = useRef(null)

  const [promptModalOpen, setPromptModalOpen] = useState(false)
  const [promptPreview, setPromptPreview] = useState('')

  // Mock report data
  const mockReports = {
    'mock-duolingo-growth-report': {
      id: 'mock-duolingo-growth-report',
      name: 'Duolingo Growth Signal Report',
      sections: duolingoMockData.sections.map((section, index) => ({
        sectionId: `mock-duolingo-${index}`,
        number: section.number,
        title: section.title,
        content: section.content,
        link: '',
        attachments: section.attachments || []
      }))
    },
    'mock-calvinklein-growth-report': {
      id: 'mock-calvinklein-growth-report',
      name: 'Calvin Klein Growth Signal Report',
      sections: calvinkleinMockData.sections.map((section, index) => ({
        sectionId: `mock-calvinklein-${index}`,
        number: section.number,
        title: section.title,
        content: section.content,
        link: '',
        attachments: section.attachments || []
      }))
    }
  }

  // Check if this is a mock report
  const isMockReport = reportId && mockReports[reportId]
  const mockReportData = isMockReport ? mockReports[reportId] : null

  // Use mock report data if available, otherwise use currentReport
  const activeReport = mockReportData || currentReport
  const activeSections = activeReport?.sections || []
  const current = useMemo(() => activeSections[selectedIndex] || activeSections[0], [activeSections, selectedIndex])

  // Select report directly if coming from /report/view/:reportId
  useEffect(() => {
    if (reportId && !isMockReport && reports?.length) {
      const targetReport = reports.find(r => r.id === reportId)
      if (targetReport) {
        selectReport(reportId)
        // Also select the corresponding template
        setCurrentTemplate(targetReport.templateId)
        setSelectedIndex(0)
      }
    } else if (isMockReport) {
      // For mock reports, just set the selected index
      setSelectedIndex(0)
    }
  }, [reportId, reports, selectReport, setCurrentTemplate, isMockReport])

  // Select template based on route param (supports id or slug name)
  useEffect(() => {
    if (!templateId || !templates?.length) return
    const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    const byId = templates.find((t) => t.id === templateId)
    const bySlug = templates.find((t) => slug(t.name) === slug(templateId))
    if (byId || bySlug) {
      setCurrentTemplate((byId || bySlug).id)
    } else {
      // If not found, create a new template from slug name and select it
      const name = templateId
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      createTemplate(name)
      // createTemplate already selects the new template
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, templates?.length])

  // Ensure there is always one report for the current template
  useEffect(() => {
    if (!currentTemplateId) return
    const list = (reports || []).filter((r) => r.templateId === currentTemplateId)
    if (!list.length) {
      createReport(currentTemplateId, `Reporte de ${currentTemplate?.name || 'Template'}`)
      setSelectedIndex(0)
      return
    }
    // If there are reports but another one is selected (or none), pick the most recent of this template
    const preferred = list[list.length - 1]
    if (!currentReportId || !list.some((r) => r.id === currentReportId)) {
      selectReport(preferred.id)
      setSelectedIndex(0)
    }
  }, [currentTemplateId, reports?.length])

  function exportJSON() {
    if (!activeReport) return
    const blob = new Blob([JSON.stringify(activeReport, null, 2)], { type: 'application/json' })
    downloadBlob(blob, `${(activeReport.name || 'report').replace(/\s+/g, '_')}.json`)
  }

  function onImportJSON(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        // Allow importing a full report or just { sections: [...] }
        let importedSections = []
        if (Array.isArray(data.sections)) {
          importedSections = data.sections
        } else if (Array.isArray(data?.sections)) {
          importedSections = data.sections
        } else {
          throw new Error('JSON inválido: no se encontró array "sections"')
        }
        if (!currentReportId) {
          // Create a new report based on current template
          createReport(currentTemplateId, data.name || 'Reporte importado')
        }
        // Apply into current report
        updateReportSection(currentReportId || '', 0, {}) // noop to ensure report exists
        // Replace full sections list
        // Note: using internal set by calling reorder then patch is cumbersome; quick replace via state mutation API isn’t exposed.
        // Workaround: duplicate current report with imported sections
        const imported = { ...currentReport, sections: importedSections }
        const blob = new Blob([JSON.stringify(imported, null, 2)], { type: 'application/json' })
        // Provide quick feedback via download of normalized file; for full state injection we need a dedicated API; defer for admin UI.
        downloadBlob(blob, 'report.imported.review.json')
        alert('Import cargado. Revisión generada como report.imported.review.json. Integración directa al estado estará en la UI de administración.')
      } catch (err) {
        alert('No se pudo importar el JSON: ' + err.message)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function exportMarkdown() {
    const md = buildMarkdown(activeSections)
    const blob = new Blob([md], { type: 'text/markdown' })
    downloadBlob(blob, 'report.md')
  }

  function printPDF() {
    const html = buildPrintableHTML(activeSections)
    const w = window.open('', '_blank')
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
    w.focus()
    w.onload = () => w.print()
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function buildMarkdown(list) {
    const lines = []
    list.forEach((s) => {
      const header = (s.number ? `${s.number} ` : '') + s.title
      const level = inferHeaderLevel(s.number)
      lines.push('#'.repeat(level) + ' ' + header)
      lines.push('')
      if (s.content && s.content.trim()) {
        lines.push(s.content.trim())
        lines.push('')
      }
      if ((s.attachments && s.attachments.length) || (s.link && s.link.trim())) {
        lines.push('Attachments:')
        if (s.link && s.link.trim()) lines.push(`- Main reference: ${s.link.trim()}`)
        ;(s.attachments || []).forEach((att) => {
          const name = att.name ? att.name : 'Attachment'
          const url = att.url ? ' — ' + att.url : ''
          lines.push(`- ${name}${url}`)
        })
        lines.push('')
      }
    })
    return lines.join('\n')
  }

  function inferHeaderLevel(number) {
    if (!number) return 2
    const depth = (number.match(/\./g) || []).length
    return Math.min(1 + depth, 5)
  }

  function headingTagForLevel(level) {
    if (level <= 2) return 'h2'
    if (level === 3) return 'h3'
    if (level === 4) return 'h4'
    return 'h5'
  }

  function buildPrintableHTML(list) {
    const sectionsHtml = list
      .map((s, idx) => {
        const level = inferHeaderLevel(s.number)
        const tag = headingTagForLevel(level)
        const header = `${s.number ? s.number + ' ' : ''}${s.title}`.trim()
        const content = s.content ? `<div class="content">${escapeHtml(s.content)}</div>` : ''
        const att = ((s.attachments && s.attachments.length) || (s.link && s.link.trim()))
          ? `<div class="attachments"><div class="att-title">Attachments</div><ul>${
              (s.link && s.link.trim() ? `<li><span>Main reference:</span> ${escapeHtml(s.link.trim())}</li>` : '') +
              (s.attachments || [])
                .map((a) => `<li><span>${escapeHtml(a.name || 'Attachment')}</span>${a.url ? ' — ' + escapeHtml(a.url) : ''}</li>`)
                .join('')
            }</ul></div>`
          : ''
        const pb = level <= 2 && idx !== 0 ? ' page-break-before' : ''
        return `<section class="doc-section level-${level}${pb}"><${tag} class="h h-${level}">${escapeHtml(header)}</${tag}>${content}${att}</section>`
      })
      .join('')

    const today = new Date().toLocaleDateString()
    const docTitle = escapeHtml(activeReport?.name || 'Growth Signal Report')

    const coverLeft = escapeHtml(activeReport?.cover?.left || '')
    const coverRight = escapeHtml(activeReport?.cover?.right || '')

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${docTitle}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 18mm;
    }
    @media print {
      .page-break-before { page-break-before: always; }
      .no-print { display: none !important; }
      header.site, footer.site { position: fixed; left: 0; right: 0; color: #6b7280; }
      header.site { top: 0; }
      footer.site { bottom: 0; }
      footer.site .pnum:after { counter-increment: page; content: counter(page); }
    }

    :root {
      --ink: #111827; /* gray-900 */
      --muted: #4b5563; /* gray-600 */
      --light: #f3f4f6; /* gray-100 */
      --brand: #111827; /* neutral brand to match PDF */
    }

    html, body {
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
      color: var(--ink);
    }
    body { line-height: 1.5; }

    .title {
      font-size: 28px;
      font-weight: 800;
      margin: 0 0 8px 0;
    }
    .subtitle { color: var(--muted); font-size: 13px; margin-bottom: 18px; }
    .divider { height: 1px; background: #e5e7eb; margin: 12px 0 18px; }

    .h { margin: 0 0 6px; }
    .h-1 { font-size: 20px; font-weight: 800; }
    .h-2 { font-size: 18px; font-weight: 700; }
    .h-3 { font-size: 16px; font-weight: 600; }
    .h-4 { font-size: 15px; font-weight: 600; }
    .doc-section { margin: 10px 0 16px; }
    .doc-section.level-1 { margin-top: 18px; }

    .content { white-space: pre-wrap; font-size: 13px; }
    .content p { margin: 0 0 8px; }
    .content ul { margin: 6px 0 8px 18px; }
    .content li { margin: 2px 0; }
    .content strong { font-weight: 700; }

    .attachments { background: #fafafa; border: 1px solid #eee; border-radius: 6px; padding: 8px 10px; margin-top: 8px; }
    .attachments .att-title { font-size: 12px; font-weight: 700; letter-spacing: .02em; color: var(--muted); margin-bottom: 6px; }
    .attachments ul { margin: 0; padding-left: 16px; }
    .attachments li { margin: 2px 0; font-size: 12px; }
    .attachments li span { font-weight: 600; }

    /* Small, subtle meta row under title */
    .meta { display: flex; gap: 8px; color: var(--muted); font-size: 12px; }
    .meta .dot { width: 4px; height: 4px; background: var(--muted); border-radius: 50%; align-self: center; }

    /* Cover */
    .cover {
      display: block;
      page-break-after: avoid;
      margin-bottom: 10mm;
    }
    .cover-hero {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 8mm;
      align-items: center;
      margin-bottom: 6mm;
    }
    .hero-box { width: 60mm; height: 36mm; background: #e5e7eb; border-radius: 6px; overflow: hidden; }
    .hero-box img { width: 100%; height: 100%; object-fit: cover; display: block; }
  </style>
</head>
<body>
  <header class="site">
    <div style="height:6mm"></div>
  </header>
  <footer class="site">
    <div style="display:flex; justify-content:space-between; padding:4mm 0; font-size:11px;">
      <div>${docTitle}</div>
      <div class="pnum">Page </div>
    </div>
  </footer>
  <main>
    <section class="cover">
      <div class="cover-hero">
        ${coverLeft ? `<div class="hero-box"><img src="${coverLeft}" alt="Cover Left" /></div>` : '<div class="hero-box"></div>'}
        <div></div>
        ${coverRight ? `<div class="hero-box"><img src="${coverRight}" alt="Cover Right" /></div>` : '<div class="hero-box"></div>'}
      </div>
      <h1 class="title">${docTitle}</h1>
      <div class="meta"><div>${today}</div><div class="dot"></div><div>Generated</div></div>
      <div class="divider"></div>
    </section>
    ${sectionsHtml}
  </main>
</body>
</html>`
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
  }

  function resolveSectionPrompt(sectionId) {
    const cat = sectionsCatalog[sectionId]
    if (!cat) return ''
    const inline = String(cat.promptText || '').trim()
    if (inline) return inline
    const key = cat.key || ''
    if (!key) return ''
    const path = `/src/prompts/${key}/prompt.md`
    const content = PROMPT_FILES[path]
    return typeof content === 'string' ? content : ''
  }

  function openPromptForCurrent() {
    const sId = current?.sectionId
    if (!sId) return
    const text = resolveSectionPrompt(sId)
    if (!text) {
      alert('Esta sección utiliza prompt, pero no hay prompt configurado ni archivo local encontrado.')
      return
    }
    setPromptPreview(text)
    setPromptModalOpen(true)
  }

  return (
    <main aria-label="Contenido principal: Report Builder">
      <CContainer fluid>
        <CRow className="mb-4">
          <CCol>
            {reportId && (
              <div className="mb-2">
                <CButton color="secondary" variant="outline" size="sm" as={Link} to="/report">
                  <CIcon icon={freeSet.cilArrowLeft} className="me-2" />
                  Volver al listado
                </CButton>
              </div>
            )}
            <h1 className="h3">{reportId ? `Ver Reporte: ${activeReport?.name || 'Sin nombre'}` : 'Report Builder'}</h1>
            <p className="text-medium-emphasis">
              {reportId
                ? 'Visualiza y exporta este reporte. Los cambios se guardan automáticamente.'
                : 'Edita, reordena y exporta tu reporte. (Esqueleto inicial)'
              }
            </p>
            <CAlert color={reportId ? "success" : "info"} className="mt-2" role="note">
              <strong>{reportId ? 'Modo Visualización:' : 'Cómo funciona:'}</strong>
              {reportId
                ? ' Este reporte está en modo de solo lectura. Puedes exportarlo pero no modificar su estructura.'
                : ' 1) Selecciona un Template en el selector de abajo. 2) Se creará o seleccionará automáticamente un reporte basado en ese template. 3) Edita las secciones del reporte y usa la barra de acciones para exportar.'
              }
            </CAlert>
          </CCol>
          <CCol xs="12" sm="auto" className="text-sm-end">
            <CButtonGroup role="toolbar" aria-label="Acciones de reporte">
              <CButton color="secondary" variant="outline" onClick={exportJSON} title="Exportar JSON">
                Export JSON
              </CButton>
              <label className="btn btn-outline-secondary mb-0" title="Importar JSON">
                Import JSON
                <input type="file" accept="application/json" hidden onChange={onImportJSON} />
              </label>
              <CButton color="secondary" variant="outline" onClick={exportMarkdown} title="Exportar Markdown">
                Export MD
              </CButton>
              <CButton color="primary" onClick={printPDF} title="Imprimir / Exportar PDF">
                Print / PDF
              </CButton>
            </CButtonGroup>
          </CCol>
        </CRow>

        {!reportId && (
          <CRow className="mb-3" role="region" aria-label="Gestión de templates">
            <CCol md={6} className="d-flex align-items-center gap-2">
              <CFormLabel htmlFor="template-select" className="mb-0">Template</CFormLabel>
              <CFormSelect
                id="template-select"
                value={currentTemplateId || ''}
                onChange={(e) => setCurrentTemplate(e.target.value)}
                aria-label="Seleccionar template"
              >
                {(templates || []).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6} className="text-md-end d-flex flex-wrap gap-2 justify-content-md-end mt-2 mt-md-0">
              <CButton color="secondary" variant="outline" onClick={() => createTemplate('Nuevo template')}>
                Nuevo
              </CButton>
              <CButton color="secondary" variant="outline" onClick={() => duplicateTemplate(currentTemplateId)} disabled={!currentTemplateId}>
                Duplicar
              </CButton>
              <CButton
                color="secondary"
                variant="outline"
                onClick={() => {
                  const name = prompt('Nuevo nombre del template', currentTemplate?.name || '')
                  if (name && name.trim()) renameTemplate(currentTemplateId, name.trim())
                }}
                disabled={!currentTemplateId}
              >
                Renombrar
              </CButton>
              <CButton
                color="danger"
                variant="outline"
                onClick={() => {
                  if (!currentTemplateId) return
                  if (confirm('¿Eliminar template actual? Esta acción no se puede deshacer.')) {
                    deleteTemplate(currentTemplateId)
                  }
                }}
                disabled={!currentTemplateId}
              >
                Eliminar
              </CButton>
            </CCol>
          </CRow>
        )}

        {/* Reportes se gestionan automáticamente: al elegir template se crea/selecciona uno */}

        <CRow>
          <CCol md={4} aria-label="Lista de secciones">
            <CListGroup role="navigation" aria-label="Secciones del reporte">
              {activeSections.map((s, idx) => (
                <CListGroupItem
                  key={`${s.sectionId}-${idx}`}
                  active={activeSections[selectedIndex] === s}
                  onClick={() => setSelectedIndex(idx)}
                  role="button"
                  tabIndex={0}
                  draggable={!isMockReport}
                  aria-grabbed={draggingIdRef.current === s.id}
                  onDragStart={(e) => {
                    if (!isMockReport) {
                      draggingIdRef.current = String(idx)
                      e.dataTransfer.effectAllowed = 'move'
                    }
                  }}
                  onDragOver={(e) => {
                    if (!isMockReport) e.preventDefault()
                  }}
                  onDrop={(e) => {
                    if (!isMockReport) {
                      e.preventDefault()
                      const from = parseInt(draggingIdRef.current, 10)
                      const to = idx
                      if (!Number.isNaN(from) && from !== to && currentReportId) {
                        reorderReportSections(currentReportId, from, to)
                        setSelectedIndex(to)
                      }
                      draggingIdRef.current = null
                    }
                  }}
                  onDragEnd={() => {
                    draggingIdRef.current = null
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedIndex(idx)
                    if (!isMockReport && e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                      e.preventDefault()
                      const delta = e.key === 'ArrowUp' ? -1 : 1
                      const from = idx
                      const to = Math.max(0, Math.min(activeSections.length - 1, from + delta))
                      if (from !== to && currentReportId) {
                        reorderReportSections(currentReportId, from, to)
                        setSelectedIndex(to)
                      }
                    }
                  }}
                >
                  <span className="me-2 text-medium-emphasis">{s.number || '—'}</span>
                  <span>{s.title}</span>
                </CListGroupItem>
              ))}
            </CListGroup>
          </CCol>

          <CCol md={8} aria-label="Editor de sección">
            {current && (currentReportId || isMockReport) && (
              <CForm onSubmit={(e) => e.preventDefault()}>
                <CRow className="g-3">
                  <CCol md={3}>
                    <CFormLabel>Número</CFormLabel>
                    <div className="form-control-plaintext">
                      {isMockReport ? (current.number || '—') : (sectionsCatalog[current.sectionId]?.defaultNumber || '—')}
                    </div>
                  </CCol>
                  <CCol md={9}>
                    <CFormLabel>Título</CFormLabel>
                    <div className="form-control-plaintext">
                      {isMockReport ? current.title : (sectionsCatalog[current.sectionId]?.defaultTitle || '—')}
                    </div>
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="field-link">Referencia principal (URL o ruta)</CFormLabel>
                    <CFormInput
                      id="field-link"
                      value={current.link}
                      onChange={(e) => !isMockReport && updateReportSection(currentReportId, selectedIndex, { link: e.target.value })}
                      placeholder="https://... o C:\\ruta\\archivo.pdf"
                      readOnly={isMockReport}
                    />
                  </CCol>

                  <CCol md={12}>
                    <div className="d-flex justify-content-between align-items-center">
                      <CFormLabel htmlFor="field-content" className="m-0">Contenido</CFormLabel>
                      {!isMockReport && sectionsCatalog[current.sectionId]?.usesPrompt && (
                        <CButton
                          size="sm"
                          color="success"
                          variant="outline"
                          onClick={openPromptForCurrent}
                          aria-label={`Generar contenido para la sección ${sectionsCatalog[current.sectionId]?.defaultTitle || ''}`}
                        >
                          Generar Contenido
                        </CButton>
                      )}
                    </div>
                    <CFormTextarea
                      id="field-content"
                      rows={8}
                      value={current.content}
                      onChange={(e) => !isMockReport && updateReportSection(currentReportId, selectedIndex, { content: e.target.value })}
                      readOnly={isMockReport}
                    />
                  </CCol>

                  <CCol md={12}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <CFormLabel className="m-0">Adjuntos</CFormLabel>
                      {!isMockReport && (
                        <CButton
                          size="sm"
                          color="secondary"
                          variant="outline"
                          onClick={() => {
                            const att = [...(current.attachments || []), { name: '', url: '' }]
                            updateReportSection(currentReportId, selectedIndex, { attachments: att })
                          }}
                        >
                          + Agregar adjunto
                        </CButton>
                      )}
                    </div>
                    {(current.attachments || []).map((att, idx) => (
                      <CInputGroup className="mb-2" key={idx}>
                        <CInputGroupText>Nombre</CInputGroupText>
                        <CFormInput
                          aria-label={`Nombre del adjunto ${idx + 1}`}
                          value={att.name || ''}
                          onChange={(e) => !isMockReport && (() => {
                            const list = [...(current.attachments || [])]
                            list[idx] = { ...list[idx], name: e.target.value }
                            updateReportSection(currentReportId, selectedIndex, { attachments: list })
                          })()}
                          readOnly={isMockReport}
                        />
                        <CInputGroupText>URL</CInputGroupText>
                        <CFormInput
                          aria-label={`URL del adjunto ${idx + 1}`}
                          value={att.url || ''}
                          onChange={(e) => !isMockReport && (() => {
                            const list = [...(current.attachments || [])]
                            list[idx] = { ...list[idx], url: e.target.value }
                            updateReportSection(currentReportId, selectedIndex, { attachments: list })
                          })()}
                          readOnly={isMockReport}
                        />
                        {!isMockReport && (
                          <CButton
                            color="danger"
                            variant="outline"
                            onClick={() => {
                              const list = [...(current.attachments || [])]
                              list.splice(idx, 1)
                              updateReportSection(currentReportId, selectedIndex, { attachments: list })
                            }}
                          >
                            Quitar
                          </CButton>
                        )}
                      </CInputGroup>
                    ))}
                  </CCol>
                </CRow>
              </CForm>
            )}
          </CCol>
        </CRow>
      </CContainer>
      {/* Modal para ver/copiar el Prompt */}
      {!isMockReport && (
        <CModal visible={promptModalOpen} onClose={() => setPromptModalOpen(false)} aria-labelledby="prompt-modal-title">
          <CModalHeader>
            <h5 id="prompt-modal-title" className="modal-title">Prompt configurado</h5>
          </CModalHeader>
          <CModalBody>
            <CFormTextarea value={promptPreview} rows={12} readOnly aria-label="Prompt para generar contenido" />
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={() => setPromptModalOpen(false)}>Cerrar</CButton>
            <CButton color="primary" onClick={() => { navigator.clipboard?.writeText(promptPreview); }}>Copiar</CButton>
          </CModalFooter>
        </CModal>
      )}
    </main>
  )
}

export default Report
