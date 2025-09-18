import React, { useMemo, useRef, useState } from 'react'
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
} from '@coreui/react'
import { useReportSections } from '../../hooks/useReportSections'

const Report = () => {
  const {
    // templates
    templates,
    currentTemplateId,
    currentTemplate,
    createTemplate,
    selectTemplate,
    renameTemplate,
    deleteTemplate,
    duplicateTemplate,
    // sections
    sections,
    setSections,
    updateSection,
    addAttachment,
    updateAttachment,
    removeAttachment,
    reset,
    moveBefore,
    moveBy,
  } = useReportSections()
  const [selectedId, setSelectedId] = useState(sections[0]?.id || null)
  const draggingIdRef = useRef(null)

  const current = useMemo(() => sections.find((s) => s.id === selectedId) || sections[0], [sections, selectedId])

  function exportJSON() {
    const blob = new Blob([JSON.stringify({ sections }, null, 2)], { type: 'application/json' })
    downloadBlob(blob, 'report.json')
  }

  function onImportJSON(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (!Array.isArray(data.sections)) throw new Error('JSON inválido: falta array sections')
        const normalized = data.sections.map((s) => ({
          id: s.id || crypto.randomUUID(),
          number: s.number || '',
          title: s.title || '',
          content: s.content || '',
          link: s.link || '',
          attachments: Array.isArray(s.attachments) ? s.attachments : [],
        }))
        setSections(normalized)
        setSelectedId(normalized[0]?.id || null)
      } catch (err) {
        alert('No se pudo importar el JSON: ' + err.message)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function exportMarkdown() {
    const md = buildMarkdown(sections)
    const blob = new Blob([md], { type: 'text/markdown' })
    downloadBlob(blob, 'report.md')
  }

  function printPDF() {
    const html = buildPrintableHTML(sections)
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
          </CCol>
          <CCol xs="12" sm="auto" className="text-sm-end">
            <CButtonGroup role="toolbar" aria-label="Acciones de reporte">
              <CButton color="secondary" variant="outline" onClick={reset} title="Restablecer plantilla">
                Reset
              </CButton>
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
              onChange={(e) => selectTemplate(e.target.value)}
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

        <CRow>
          <CCol md={4} aria-label="Lista de secciones">
            <CListGroup role="navigation" aria-label="Secciones del reporte">
              {sections.map((s) => (
                <CListGroupItem
                  key={s.id}
                  active={current?.id === s.id}
                  onClick={() => setSelectedId(s.id)}
                  role="button"
                  tabIndex={0}
                  draggable
                  aria-grabbed={draggingIdRef.current === s.id}
                  onDragStart={(e) => {
                    draggingIdRef.current = s.id
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    const sourceId = draggingIdRef.current
                    const targetId = s.id
                    if (sourceId && targetId && sourceId !== targetId) {
                      moveBefore(sourceId, targetId)
                    }
                    draggingIdRef.current = null
                  }}
                  onDragEnd={() => {
                    draggingIdRef.current = null
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedId(s.id)
                    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                      e.preventDefault()
                      moveBy(s.id, e.key === 'ArrowUp' ? -1 : 1)
                    }
                  }}
                >
                  <span className="me-2 text-medium-emphasis">{s.number}</span>
                  <span>{s.title}</span>
                </CListGroupItem>
              ))}
            </CListGroup>
          </CCol>

          <CCol md={8} aria-label="Editor de sección">
            {current && (
              <CForm onSubmit={(e) => e.preventDefault()}>
                <CRow className="g-3">
                  <CCol md={3}>
                    <CFormLabel htmlFor="field-number">Número</CFormLabel>
                    <CFormInput
                      id="field-number"
                      value={current.number}
                      onChange={(e) => updateSection(current.id, { number: e.target.value })}
                    />
                  </CCol>
                  <CCol md={9}>
                    <CFormLabel htmlFor="field-title">Título</CFormLabel>
                    <CFormInput
                      id="field-title"
                      value={current.title}
                      onChange={(e) => updateSection(current.id, { title: e.target.value })}
                    />
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="field-link">Referencia principal (URL o ruta)</CFormLabel>
                    <CFormInput
                      id="field-link"
                      value={current.link}
                      onChange={(e) => updateSection(current.id, { link: e.target.value })}
                      placeholder="https://... o C:\\ruta\\archivo.pdf"
                    />
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="field-content">Contenido</CFormLabel>
                    <CFormTextarea
                      id="field-content"
                      rows={8}
                      value={current.content}
                      onChange={(e) => updateSection(current.id, { content: e.target.value })}
                    />
                  </CCol>

                  <CCol md={12}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <CFormLabel className="m-0">Adjuntos</CFormLabel>
                      <CButton size="sm" color="secondary" variant="outline" onClick={() => addAttachment(current.id)}>
                        + Agregar adjunto
                      </CButton>
                    </div>
                    {(current.attachments || []).map((att, idx) => (
                      <CInputGroup className="mb-2" key={idx}>
                        <CInputGroupText>Nombre</CInputGroupText>
                        <CFormInput
                          aria-label={`Nombre del adjunto ${idx + 1}`}
                          value={att.name || ''}
                          onChange={(e) => updateAttachment(current.id, idx, { name: e.target.value })}
                        />
                        <CInputGroupText>URL</CInputGroupText>
                        <CFormInput
                          aria-label={`URL del adjunto ${idx + 1}`}
                          value={att.url || ''}
                          onChange={(e) => updateAttachment(current.id, idx, { url: e.target.value })}
                        />
                        <CButton color="danger" variant="outline" onClick={() => removeAttachment(current.id, idx)}>
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
