import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CContainer, CRow, CCol, CButton, CButtonGroup } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { freeSet } from '@coreui/icons'
import { useTemplatesModel } from '../../hooks/useTemplatesModel'
import { duolingoMockData, calvinkleinMockData } from '../../mock-report-data.js'

// Very small subset of helpers from Report.jsx
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

function exportMarkdown(sections) {
  const lines = []
  sections.forEach((s) => {
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
  const md = lines.join('\n')
  const blob = new Blob([md], { type: 'text/markdown' })
  downloadBlob(blob, 'report.md')
}

function exportJSON(report) {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  downloadBlob(blob, `${(report.name || 'report').replace(/\s+/g, '_')}.json`)
}

function inferHeaderLevel(number) {
  if (!number) return 2
  const depth = (number.match(/\./g) || []).length
  return Math.min(1 + depth, 5)
}

// Minimal Markdown renderer (basic headings, bold/italic, lists, links, code)
function markdownToHtml(md = '') {
  let html = md
  // Escape HTML first
  html = html
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
  // Code blocks ```
  html = html.replace(/```([\s\S]*?)```/g, (m, p1) => `<pre><code>${p1}</code></pre>`) 
  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  // Headings ##, ###, ####
  html = html.replace(/^######\s?(.+)$/gm, '<h6>$1</h6>')
  html = html.replace(/^#####\s?(.+)$/gm, '<h5>$1</h5>')
  html = html.replace(/^####\s?(.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^###\s?(.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^##\s?(.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^#\s?(.+)$/gm, '<h1>$1</h1>')
  // Bold and italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1<\/a>')
  // Unordered lists - item
  // Convert blocks of lines starting with - or * into <ul><li>..</li></ul>
  html = html.replace(/(?:^|\n)([-*] .+(?:\n[-*] .+)*)/g, (match) => {
    const items = match
      .trim()
      .split(/\n/)
      .map((line) => line.replace(/^[-*]\s+/, ''))
      .map((t) => `<li>${t}</li>`) 
      .join('')
    return `\n<ul>${items}<\/ul>`
  })
  // Paragraphs: wrap loose lines into <p>
  html = html
    .split(/\n\n+/)
    .map((block) => /^(<h\d|<ul>|<pre>|<p>|<blockquote>|<table>|<img|<code|<div)/.test(block.trim()) ? block : `<p>${block.trim()}</p>`)
    .join('\n')
  return html
}

const ReportViewer = () => {
  const { reportId } = useParams()
  const { reports, selectReport, setCurrentTemplate, currentReport, templates } = useTemplatesModel()

  const mockReports = {
    'mock-duolingo-growth-report': {
      id: 'mock-duolingo-growth-report',
      name: 'Duolingo Growth Signal Report',
      sections: duolingoMockData.sections,
    },
    'mock-calvinklein-growth-report': {
      id: 'mock-calvinklein-growth-report',
      name: 'Calvin Klein Growth Signal Report',
      sections: calvinkleinMockData.sections,
    },
  }

  const isMockReport = reportId && mockReports[reportId]
  const activeReport = isMockReport ? mockReports[reportId] : currentReport
  const sections = activeReport?.sections || []

  // Map index -> fetched markdown HTML when s.link ends with .md
  const [mdMap, setMdMap] = useState({})

  useEffect(() => {
    let cancelled = false
    async function loadMd() {
      const tasks = sections.map(async (s, idx) => {
        const link = (s.link || '').trim()
        if (link && /\.md($|\?)/i.test(link)) {
          try {
            const res = await fetch(link)
            if (!res.ok) return
            const text = await res.text()
            if (!cancelled) {
              setMdMap((prev) => ({ ...prev, [idx]: markdownToHtml(text) }))
            }
          } catch (_) {
            // ignore fetch errors; fallback to inline content
          }
        }
      })
      await Promise.allSettled(tasks)
    }
    setMdMap({})
    if (sections.length) loadMd()
    return () => { cancelled = true }
  }, [sections])

  // If non-mock, ensure we select the right report in model but do not show editor UI
  useEffect(() => {
    if (!isMockReport && reports?.length) {
      const target = reports.find((r) => r.id === reportId)
      if (target) {
        selectReport(reportId)
        setCurrentTemplate(target.templateId)
      }
    }
  }, [isMockReport, reports, reportId, selectReport, setCurrentTemplate])

  const title = activeReport?.name || 'Report'
  const toc = useMemo(() => {
    return sections.map((s, idx) => ({
      id: `sec-${idx}`,
      label: `${s.number ? s.number + ' ' : ''}${s.title}`,
      level: inferHeaderLevel(s.number),
    }))
  }, [sections])

  return (
    <main aria-label="Contenido principal: Report Viewer">
      <CContainer fluid>
        <CRow className="mb-4">
          <CCol>
            <div className="mb-2">
              <CButton color="secondary" variant="outline" size="sm" as={Link} to="/report">
                <CIcon icon={freeSet.cilArrowLeft} className="me-2" />
                Volver al listado
              </CButton>
            </div>
            <h1 className="h3">{title}</h1>
            <p className="text-medium-emphasis">Vista de lectura. Sin controles de edición.</p>
          </CCol>
          <CCol xs="12" sm="auto" className="text-sm-end">
            <CButtonGroup role="toolbar" aria-label="Acciones de exportación">
              {activeReport && (
                <CButton color="secondary" variant="outline" onClick={() => exportJSON(activeReport)}>
                  Export JSON
                </CButton>
              )}
              <CButton color="secondary" variant="outline" onClick={() => exportMarkdown(sections)}>
                Export MD
              </CButton>
              <CButton color="primary" onClick={() => window.print()}>
                Print / PDF
              </CButton>
            </CButtonGroup>
          </CCol>
        </CRow>

        <CRow>
          {/* Optional Table of Contents on the left (hide on small screens) */}
          <CCol lg={3} className="d-none d-lg-block">
            <nav aria-label="Tabla de contenidos" className="position-sticky" style={{ top: 16 }}>
              <div className="small text-body-secondary mb-2">Tabla de contenidos</div>
              <ul className="list-unstyled">
                {toc.map((t) => (
                  <li key={t.id} className="mb-1" style={{ marginLeft: (t.level - 1) * 8 }}>
                    <a href={`#${t.id}`} className="text-decoration-none">{t.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </CCol>
          <CCol lg={9}>
            <article className="report-reader" style={{ maxWidth: 860 }}>
              {sections.map((s, idx) => {
                const level = inferHeaderLevel(s.number)
                const Tag = level <= 2 ? 'h2' : level === 3 ? 'h3' : level === 4 ? 'h4' : 'h5'
                const anchorId = `sec-${idx}`
                const html = mdMap[idx] ?? markdownToHtml(s.content || '')
                return (
                  <section id={anchorId} key={`${s.sectionId || s.title}-${idx}`} className="mb-4 pb-3 border-bottom">
                    <Tag className="mb-2">{`${s.number ? s.number + ' ' : ''}${s.title}`}</Tag>
                    {s.link && (
                      <div className="mb-2">
                        <strong>Referencia:</strong> <span>{s.link}</span>
                      </div>
                    )}
                    {Array.isArray(s.attachments) && s.attachments.length > 0 && (
                      <div className="mb-2">
                        <strong>Adjuntos:</strong>
                        <ul>
                          {s.attachments.map((a, i) => (
                            <li key={i}>{a.name}{a.url ? ` — ${a.url}` : ''}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div dangerouslySetInnerHTML={{ __html: html }} />
                  </section>
                )
              })}
            </article>
          </CCol>
        </CRow>
      </CContainer>
    </main>
  )
}

export default ReportViewer
