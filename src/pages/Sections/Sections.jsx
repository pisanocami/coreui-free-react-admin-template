import React, { useMemo, useState } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
  CListGroup,
  CListGroupItem,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CToaster,
  CToast,
  CToastBody,
} from '@coreui/react'
import { useTemplatesModel } from '../../hooks/useTemplatesModel'

const Sections = () => {
  const { sectionsCatalog, createSection, updateSection, deleteSection } = useTemplatesModel()
  const allSections = useMemo(() => Object.values(sectionsCatalog), [sectionsCatalog])
  const [form, setForm] = useState({ defaultNumber: '', defaultTitle: '' })
  const [errors, setErrors] = useState({})
  const [filterText, setFilterText] = useState('')
  const [toasts, setToasts] = useState([])
  const [modalDelete, setModalDelete] = useState(null) // holds section to delete

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
            <CForm onSubmit={(e) => e.preventDefault()}>
              <CFormLabel>Nueva sección</CFormLabel>
              <div className="d-flex gap-2 align-items-center">
                <CFormInput
                  placeholder="Número (opcional), p.ej. 1.1."
                  value={form.defaultNumber}
                  onChange={(e) => setForm((f) => ({ ...f, defaultNumber: e.target.value }))}
                  />
                <CFormInput
                  placeholder="Título de la sección"
                  value={form.defaultTitle}
                  onChange={(e) => setForm((f) => ({ ...f, defaultTitle: e.target.value }))}
                  aria-describedby="new-section-title-help"
                />
                <CButton
                  color="primary"
                  onClick={() => {
                    const title = form.defaultTitle.trim()
                    if (!title) {
                      setErrors({ title: 'El título es requerido' })
                      return
                    }
                    createSection({ defaultNumber: form.defaultNumber.trim(), defaultTitle: title })
                    setForm({ defaultNumber: '', defaultTitle: '' })
                    setErrors({})
                    pushToast('Sección creada')
                  }}
                >
                  Agregar
                </CButton>
              </div>
              {errors.title && <div className="text-danger mt-1" id="new-section-title-help">{errors.title}</div>}
            </CForm>
          </CCol>
          <CCol md={6} className="mt-3 mt-md-0">
            <CFormLabel htmlFor="filter-text" className="mb-1">Buscar</CFormLabel>
            <CFormInput
              id="filter-text"
              placeholder="Filtrar por número, título o key"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <div className="text-medium-emphasis small mt-1">Resultados: {sections.length} / {allSections.length}</div>
          </CCol>
        </CRow>

        <CRow>
          <CCol md={8} aria-label="Listado de secciones">
            <CListGroup>
              {sections.map((s) => (
                <CListGroupItem key={s.id}>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <CFormInput
                      aria-label={`Número por defecto de ${s.defaultTitle}`}
                      value={s.defaultNumber || ''}
                      onChange={(e) => updateSection(s.id, { defaultNumber: e.target.value })}
                      style={{ maxWidth: 140 }}
                    />
                    <CFormInput
                      aria-label={`Título por defecto de ${s.defaultTitle}`}
                      value={s.defaultTitle || ''}
                      onChange={(e) => updateSection(s.id, { defaultTitle: e.target.value })}
                    />
                    <CButton
                      color="danger"
                      variant="outline"
                      className="ms-auto"
                      aria-label={`Eliminar sección ${s.defaultTitle}`}
                      onClick={() => setModalDelete(s)}
                    >
                      Eliminar
                    </CButton>
                  </div>
                  <div className="text-medium-emphasis small mt-1">ID: {s.id} · KEY: {s.key}</div>
                </CListGroupItem>
              ))}
            </CListGroup>
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
