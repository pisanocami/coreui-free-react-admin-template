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
} from '@coreui/react'
import { useTemplatesModel } from '../../hooks/useTemplatesModel'
import { useParams } from 'react-router-dom'

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
  const { templateId } = useParams()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const draggingIdRef = useRef(null)

  const currentSections = currentReport?.sections || []
  const current = useMemo(() => currentSections[selectedIndex] || currentSections[0], [currentSections, selectedIndex])

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
    if (!currentReport) return
    const blob = new Blob([JSON.stringify(currentReport, null, 2)], { type: 'application/json' })
    downloadBlob(blob, `${(currentReport.name || 'report').replace(/\s+/g, '_')}.json`)
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
    const md = buildMarkdown(currentSections)
    const blob = new Blob([md], { type: 'text/markdown' })
    downloadBlob(blob, 'report.md')
  }

  function printPDF() {
    const html = buildPrintableHTML(currentSections)
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
          ? `<div class="attachments"><h4>Attachments</h4><ul>${
              (s.link && s.link.trim() ? `<li>Main reference: ${escapeHtml(s.link.trim())}</li>` : '') +
              (s.attachments || [])
                .map((a) => `<li>${escapeHtml(a.name || 'Attachment')}${a.url ? ' — ' + escapeHtml(a.url) : ''}</li>`)
                .join('')
            }</ul></div>`
          : ''
        const pb = level <= 2 && idx !== 0 ? ' page-break-before' : ''
        return `<div class="section${pb}"><${tag}>${escapeHtml(header)}</${tag}>${content}${att}</div>`
      })
      .join('')

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Report</title>
  <style>
    @media print {
      .page-break-before { page-break-before: always; }
    }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 24px; }
    h1,h2,h3,h4,h5 { margin: 0 0 8px; }
    .section { margin-bottom: 20px; }
    .attachments h4 { margin: 12px 0 6px; }
    .content { white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1 class="page-title">Report</h1>
  ${sectionsHtml}
</body>
</html>`
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
  }

  return (
    <main aria-label="Contenido principal: Report Builder">
      <CContainer fluid>
        <CRow className="mb-4">
          <CCol>
            <h1 className="h3">Report Builder</h1>
            <p className="text-medium-emphasis">Edita, reordena y exporta tu reporte. (Esqueleto inicial)</p>
            <CAlert color="info" className="mt-2" role="note">
              <strong>Cómo funciona:</strong> 1) Selecciona un <em>Template</em> en el selector de abajo. 2) Se creará o seleccionará automáticamente un reporte basado en ese template. 3) Edita las secciones del reporte y usa la barra de acciones para exportar.
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

        {/* Reportes se gestionan automáticamente: al elegir template se crea/selecciona uno */}

        <CRow>
          <CCol md={4} aria-label="Lista de secciones">
            <CListGroup role="navigation" aria-label="Secciones del reporte">
              {currentSections.map((s, idx) => (
                <CListGroupItem
                  key={`${s.sectionId}-${idx}`}
                  active={currentSections[selectedIndex] === s}
                  onClick={() => setSelectedIndex(idx)}
                  role="button"
                  tabIndex={0}
                  draggable
                  aria-grabbed={draggingIdRef.current === s.id}
                  onDragStart={(e) => {
                    draggingIdRef.current = String(idx)
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    const from = parseInt(draggingIdRef.current, 10)
                    const to = idx
                    if (!Number.isNaN(from) && from !== to && currentReportId) {
                      reorderReportSections(currentReportId, from, to)
                      setSelectedIndex(to)
                    }
                    draggingIdRef.current = null
                  }}
                  onDragEnd={() => {
                    draggingIdRef.current = null
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedIndex(idx)
                    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                      e.preventDefault()
                      const delta = e.key === 'ArrowUp' ? -1 : 1
                      const from = idx
                      const to = Math.max(0, Math.min(currentSections.length - 1, from + delta))
                      if (from !== to && currentReportId) {
                        reorderReportSections(currentReportId, from, to)
                        setSelectedIndex(to)
                      }
                    }
                  }}
                >
                  <span className="me-2 text-medium-emphasis">{sectionsCatalog[s.sectionId]?.defaultNumber}</span>
                  <span>{sectionsCatalog[s.sectionId]?.defaultTitle}</span>
                </CListGroupItem>
              ))}
            </CListGroup>
          </CCol>

          <CCol md={8} aria-label="Editor de sección">
            {current && currentReportId && (
              <CForm onSubmit={(e) => e.preventDefault()}>
                <CRow className="g-3">
                  <CCol md={3}>
                    <CFormLabel>Número</CFormLabel>
                    <div className="form-control-plaintext">
                      {sectionsCatalog[current.sectionId]?.defaultNumber || '—'}
                    </div>
                  </CCol>
                  <CCol md={9}>
                    <CFormLabel>Título</CFormLabel>
                    <div className="form-control-plaintext">
                      {sectionsCatalog[current.sectionId]?.defaultTitle || '—'}
                    </div>
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="field-link">Referencia principal (URL o ruta)</CFormLabel>
                    <CFormInput
                      id="field-link"
                      value={current.link}
                      onChange={(e) => updateReportSection(currentReportId, selectedIndex, { link: e.target.value })}
                      placeholder="https://... o C:\\ruta\\archivo.pdf"
                    />
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="field-content">Contenido</CFormLabel>
                    <CFormTextarea
                      id="field-content"
                      rows={8}
                      value={current.content}
                      onChange={(e) => updateReportSection(currentReportId, selectedIndex, { content: e.target.value })}
                    />
                  </CCol>

                  <CCol md={12}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <CFormLabel className="m-0">Adjuntos</CFormLabel>
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
                    </div>
                    {(current.attachments || []).map((att, idx) => (
                      <CInputGroup className="mb-2" key={idx}>
                        <CInputGroupText>Nombre</CInputGroupText>
                        <CFormInput
                          aria-label={`Nombre del adjunto ${idx + 1}`}
                          value={att.name || ''}
                          onChange={(e) => {
                            const list = [...(current.attachments || [])]
                            list[idx] = { ...list[idx], name: e.target.value }
                            updateReportSection(currentReportId, selectedIndex, { attachments: list })
                          }}
                        />
                        <CInputGroupText>URL</CInputGroupText>
                        <CFormInput
                          aria-label={`URL del adjunto ${idx + 1}`}
                          value={att.url || ''}
                          onChange={(e) => {
                            const list = [...(current.attachments || [])]
                            list[idx] = { ...list[idx], url: e.target.value }
                            updateReportSection(currentReportId, selectedIndex, { attachments: list })
                          }}
                        />
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
                      </CInputGroup>
                    ))}
                  </CCol>
                </CRow>
              </CForm>
            )}
          </CCol>
        </CRow>
      </CContainer>
    </main>
  )
}

export default Report
