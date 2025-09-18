import React, { useMemo, useRef, useState } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CForm,
  CFormLabel,
  CFormSelect,
  CFormInput,
  CButton,
  CButtonGroup,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'
import { useTemplatesModel } from '../../hooks/useTemplatesModel'

const Templates = () => {
  const {
    templates,
    sectionsCatalog,
    currentTemplate,
    currentTemplateId,
    setCurrentTemplate,
    createTemplate,
    renameTemplate,
    deleteTemplate,
    duplicateTemplate,
    addSectionToTemplate,
    removeSectionFromTemplate,
    reorderTemplateSections,
  } = useTemplatesModel()

  const [selectedIdx, setSelectedIdx] = useState(0)
  const draggingIdxRef = useRef(null)
  const catalogArray = useMemo(() => Object.values(sectionsCatalog), [sectionsCatalog])

  const currentSectionIds = currentTemplate?.sectionIds || []
  const availableSections = useMemo(
    () => catalogArray.filter((s) => !currentSectionIds.includes(s.id)),
    [catalogArray, currentSectionIds],
  )
  const selectedSectionId = currentSectionIds[selectedIdx]
  const selectedSection = sectionsCatalog[selectedSectionId]

  return (
    <main aria-label="Administración de Plantillas">
      <CContainer fluid>
        <CRow className="mb-4">
          <CCol>
            <h1 className="h4">Plantillas</h1>
            <p className="text-medium-emphasis">Gestiona la estructura (orden y contenido) de las plantillas.</p>
          </CCol>
          <CCol xs="12" sm="auto" className="text-sm-end">
            <CButtonGroup>
              <CButton color="primary" onClick={() => createTemplate('Nueva plantilla')}>Nueva</CButton>
              <CButton color="secondary" variant="outline" disabled={!currentTemplateId} onClick={() => duplicateTemplate(currentTemplateId)}>Duplicar</CButton>
              <CButton color="secondary" variant="outline" disabled={!currentTemplateId} onClick={() => {
                const name = prompt('Nuevo nombre de la plantilla', currentTemplate?.name || '')
                if (name && name.trim()) renameTemplate(currentTemplateId, name.trim())
              }}>Renombrar</CButton>
              <CButton color="danger" variant="outline" disabled={!currentTemplateId} onClick={() => {
                if (confirm('¿Eliminar plantilla actual?')) deleteTemplate(currentTemplateId)
              }}>Eliminar</CButton>
            </CButtonGroup>
          </CCol>
        </CRow>

        <CRow className="mb-3" role="region" aria-label="Selector de plantilla">
          <CCol md={6} className="d-flex align-items-center gap-2">
            <CFormLabel htmlFor="template-select" className="mb-0">Template</CFormLabel>
            <CFormSelect id="template-select" value={currentTemplateId || ''} onChange={(e) => setCurrentTemplate(e.target.value)}>
              {(templates || []).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </CFormSelect>
          </CCol>
        </CRow>

        <CRow>
          <CCol md={6} aria-label="Secciones en la plantilla">
            <h6>Secciones en la plantilla</h6>
            <CListGroup>
              {currentSectionIds.map((sid, idx) => (
                <CListGroupItem
                  key={`${sid}-${idx}`}
                  active={idx === selectedIdx}
                  onClick={() => setSelectedIdx(idx)}
                  draggable
                  onDragStart={() => { draggingIdxRef.current = idx }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const from = draggingIdxRef.current
                    const to = idx
                    if (from != null && from !== to) {
                      reorderTemplateSections(currentTemplateId, from, to)
                      setSelectedIdx(to)
                    }
                    draggingIdxRef.current = null
                  }}
                >
                  <span className="me-2 text-medium-emphasis">{sectionsCatalog[sid]?.defaultNumber}</span>
                  <span>{sectionsCatalog[sid]?.defaultTitle}</span>
                  <CButton
                    size="sm"
                    color="danger"
                    variant="ghost"
                    className="float-end"
                    onClick={(e) => { e.stopPropagation(); removeSectionFromTemplate(currentTemplateId, sid) }}
                  >
                    Quitar
                  </CButton>
                </CListGroupItem>
              ))}
            </CListGroup>
          </CCol>

          <CCol md={6} aria-label="Catálogo de secciones">
            <h6>Catálogo de secciones</h6>
            <CForm className="mb-2" onSubmit={(e) => e.preventDefault()}>
              <CFormLabel htmlFor="add-section-select">Agregar sección a la plantilla</CFormLabel>
              <div className="d-flex gap-2">
                <CFormSelect id="add-section-select" onChange={(e) => {
                  const sid = e.target.value
                  if (!sid) return
                  addSectionToTemplate(currentTemplateId, sid)
                  e.target.value = ''
                }}>
                  <option value="">Seleccionar sección…</option>
                  {availableSections.map((s) => (
                    <option key={s.id} value={s.id}>{s.defaultNumber ? s.defaultNumber + ' ' : ''}{s.defaultTitle}</option>
                  ))}
                </CFormSelect>
              </div>
            </CForm>

            {selectedSection && (
              <div className="mt-3" role="region" aria-label="Detalle de sección seleccionada">
                <CFormLabel>Detalle</CFormLabel>
                <div><strong>Número:</strong> {selectedSection.defaultNumber || '—'}</div>
                <div><strong>Título:</strong> {selectedSection.defaultTitle || '—'}</div>
                <div className="text-medium-emphasis small">ID: {selectedSection.id}</div>
              </div>
            )}
          </CCol>
        </CRow>
      </CContainer>
    </main>
  )
}

export default Templates
