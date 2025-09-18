import React from 'react'
import { CContainer, CRow, CCol, CButton } from '@coreui/react'

const BriefSummary = () => {
  return (
    <main aria-label="Contenido principal: Resumen del Brief">
      <CContainer fluid>
        <CRow className="mb-4">
          <CCol>
            <h1 className="h3">Resumen del Brief</h1>
            <p className="text-medium-emphasis">Valida la información antes de confirmar.</p>
          </CCol>
        </CRow>
        <CRow>
          <CCol md={8} aria-label="Vista del resumen">
            {/* TODO: BriefSummaryView + ValidationChecklist */}
          </CCol>
          <CCol md={4} className="text-md-end" aria-label="Acciones">
            <div className="d-grid gap-2 d-md-block">
              <CButton color="secondary" href="#/brief/new" className="me-2">
                Editar
              </CButton>
              <CButton color="primary" aria-label="Confirmar y enviar el brief">
                Confirmar y Enviar
              </CButton>
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </main>
  )
}

export default BriefSummary
