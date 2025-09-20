import React, { useMemo, useState, useId } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CFormCheck,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CToaster,
  CToast,
  CToastBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { freeSet } from '@coreui/icons'
import { useTemplatesModel } from '../../hooks/useTemplatesModel'

const Sections = () => {
  const { sectionsCatalog, createSection, updateSection, deleteSection } = useTemplatesModel()
  const allSections = useMemo(() => Object.values(sectionsCatalog), [sectionsCatalog])
  const [form, setForm] = useState({ defaultNumber: '', defaultTitle: '', description: '', usesPrompt: false, promptText: '' })
  const [errors, setErrors] = useState({})
  const [filterText, setFilterText] = useState('')
  const [toasts, setToasts] = useState([])
  const [modalDelete, setModalDelete] = useState(null) // holds section to delete
  const [expanded, setExpanded] = useState(() => new Set())

  const toggleExpanded = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const numberId = useId()
  const titleId = useId()
  const filterId = useId()

  const sections = useMemo(() => {
    const q = filterText.trim().toLowerCase()
    if (!q) return allSections
    return allSections.filter((s) =>
      (s.defaultTitle || '').toLowerCase().includes(q) ||
      (s.defaultNumber || '').toLowerCase().includes(q) ||
      (s.key || '').toLowerCase().includes(q),
    )
  }, [allSections, filterText])

  const pushToast = (message, color = 'primary') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, color }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }

  return (
    <main aria-label="Catálogo de Secciones">
      <CContainer fluid>
        <CRow className="mb-4">
          <CCol>
            <h1 className="h4">Secciones</h1>
            <p className="text-medium-emphasis">Gestiona el catálogo de secciones reutilizables.</p>
          </CCol>
        </CRow>

        <CRow className="mb-3" role="region" aria-label="Nueva sección">
          <CCol md={6}>
            <CForm onSubmit={(e) => {
              e.preventDefault()
              const title = form.defaultTitle.trim()
              if (!title) {
                setErrors({ title: 'El título es requerido' })
                return
              }
              createSection({ defaultNumber: form.defaultNumber.trim(), defaultTitle: title, description: form.description.trim(), usesPrompt: !!form.usesPrompt, promptText: form.usesPrompt ? form.promptText.trim() : '' })
              setForm({ defaultNumber: '', defaultTitle: '', description: '', usesPrompt: false, promptText: '' })
              setErrors({})
              pushToast('Sección creada')
            }}>
              <CFormLabel htmlFor={titleId}>Nueva sección</CFormLabel>
              <div className="d-flex gap-2 align-items-center">
                <CFormInput
                  id={numberId}
                  placeholder="Número (opcional), p.ej. 1.1."
                  value={form.defaultNumber}
                  onChange={(e) => setForm((f) => ({ ...f, defaultNumber: e.target.value }))}
                  />
                <CFormInput
                  id={titleId}
                  placeholder="Título de la sección"
                  value={form.defaultTitle}
                  onChange={(e) => setForm((f) => ({ ...f, defaultTitle: e.target.value }))}
                  aria-describedby="new-section-title-help"
                  aria-invalid={!!errors.title}
                />
                <CButton
                  color="primary"
                  type="submit"
                  disabled={!form.defaultTitle.trim()}
                >
                  Agregar
                </CButton>
              </div>
              <div className="mt-2">
                <CFormLabel htmlFor={`${titleId}-desc`}>Descripción</CFormLabel>
                <CFormTextarea
                  id={`${titleId}-desc`}
                  placeholder="Descripción de la sección"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="mt-2">
                <CFormCheck
                  id={`${titleId}-usesPrompt`}
                  label="Utiliza prompt"
                  checked={!!form.usesPrompt}
                  onChange={(e) => setForm((f) => ({ ...f, usesPrompt: e.target.checked }))}
                />
                {form.usesPrompt && (
                  <div className="mt-2">
                    <CFormLabel htmlFor={`${titleId}-prompt`}>Prompt</CFormLabel>
                    <CFormTextarea
                      id={`${titleId}-prompt`}
                      placeholder="Escribe el prompt a utilizar para esta sección"
                      value={form.promptText}
                      onChange={(e) => setForm((f) => ({ ...f, promptText: e.target.value }))}
                      rows={4}
                    />
                  </div>
                )}
              </div>
              {errors.title && <div className="text-danger mt-1" id="new-section-title-help">{errors.title}</div>}
            </CForm>
          </CCol>
          <CCol md={6} className="mt-3 mt-md-0">
            <CFormLabel htmlFor={filterId} className="mb-1">Buscar</CFormLabel>
            <CFormInput
              id={filterId}
              placeholder="Filtrar por número, título o key"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <div className="text-medium-emphasis small mt-1" role="status" aria-live="polite">Resultados: {sections.length} / {allSections.length}</div>
          </CCol>
        </CRow>

        <CRow>
          <CCol md={12} aria-label="Listado de secciones">
            <div className="table-responsive">
              <CTable align="middle" hover responsive role="table">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col" style={{ width: 120 }}>Número</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Título</CTableHeaderCell>
                    <CTableHeaderCell scope="col" style={{ width: 150 }}>Utiliza prompt</CTableHeaderCell>
                    <CTableHeaderCell scope="col" style={{ width: 80 }} className="text-center">Detalles</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {sections.map((s) => (
                    <React.Fragment key={s.id}>
                      <CTableRow>
                        <CTableDataCell>
                          <CFormInput
                            aria-label={`Número por defecto de ${s.defaultTitle}`}
                            value={s.defaultNumber || ''}
                            onChange={(e) => updateSection(s.id, { defaultNumber: e.target.value })}
                          />
                        </CTableDataCell>
                        <CTableDataCell>
                          <CFormInput
                            aria-label={`Título por defecto de ${s.defaultTitle}`}
                            value={s.defaultTitle || ''}
                            onChange={(e) => updateSection(s.id, { defaultTitle: e.target.value })}
                          />
                          <div className="text-medium-emphasis small mt-1">ID: {s.id} · KEY: {s.key}</div>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CFormCheck
                            id={`usesPrompt-${s.id}`}
                            label=""
                            checked={!!s.usesPrompt}
                            onChange={(e) => updateSection(s.id, { usesPrompt: e.target.checked, ...(e.target.checked ? {} : { promptText: '' }) })}
                          />
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton color="secondary" variant="outline" size="sm" aria-label={`Ver detalles de ${s.defaultTitle}`} onClick={() => toggleExpanded(s.id)}>
                            <CIcon icon={freeSet.cilEye} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                      {expanded.has(s.id) && (
                        <CTableRow>
                          <CTableDataCell colSpan={4}>
                            <div className="row g-3">
                              <div className="col-12 col-md-6">
                                <CFormLabel>Descripción</CFormLabel>
                                <CFormTextarea
                                  aria-label={`Descripción de ${s.defaultTitle}`}
                                  rows={4}
                                  value={s.description || ''}
                                  onChange={(e) => updateSection(s.id, { description: e.target.value })}
                                />
                              </div>
                              <div className="col-12 col-md-6">
                                <CFormLabel htmlFor={`prompt-${s.id}`}>Prompt</CFormLabel>
                                {s.usesPrompt ? (
                                  <CFormTextarea
                                    id={`prompt-${s.id}`}
                                    aria-label={`Prompt para ${s.defaultTitle}`}
                                    rows={4}
                                    placeholder="Escribe el prompt a utilizar para esta sección"
                                    value={s.promptText || ''}
                                    onChange={(e) => updateSection(s.id, { promptText: e.target.value })}
                                  />
                                ) : (
                                  <div className="text-medium-emphasis">Activa "Utiliza prompt" para editar el prompt.</div>
                                )}
                              </div>
                              <div className="col-12 d-flex justify-content-end">
                                <CButton color="danger" variant="outline" size="sm" aria-label={`Eliminar sección ${s.defaultTitle}`} onClick={() => setModalDelete(s)}>
                                  <CIcon icon={freeSet.cilTrash} className="me-1" /> Eliminar
                                </CButton>
                              </div>
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      )}
                    </React.Fragment>
                  ))}
                </CTableBody>
              </CTable>
            </div>
            {sections.length === 0 && (
              <div className="text-medium-emphasis mt-3">No hay secciones que coincidan con el filtro.</div>
            )}
          </CCol>
        </CRow>

        {/* Modal de confirmación de borrado */}
        <CModal visible={!!modalDelete} onClose={() => setModalDelete(null)} aria-labelledby="confirm-delete-title">
          <CModalHeader>
            <h5 id="confirm-delete-title" className="modal-title">Confirmar eliminación</h5>
          </CModalHeader>
          <CModalBody>
            ¿Eliminar la sección "{modalDelete?.defaultTitle}" del catálogo? Esta acción no se puede deshacer.
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setModalDelete(null)}>Cancelar</CButton>
            <CButton color="danger" onClick={() => { deleteSection(modalDelete.id); setModalDelete(null); pushToast('Sección eliminada', 'danger') }}>Eliminar</CButton>
          </CModalFooter>
        </CModal>

        {/* Toaster */}
        <CToaster placement="top-end">
          {toasts.map((t) => (
            <CToast key={t.id} color={t.color} visible className="mb-2">
              <CToastBody>{t.message}</CToastBody>
            </CToast>
          ))}
        </CToaster>
      </CContainer>
    </main>
  )
}

export default Sections
