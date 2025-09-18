import React from 'react'
import { CContainer, CRow, CCol } from '@coreui/react'

const Feedback = () => {
  return (
    <main aria-label="Contenido principal: Feedback">
      <CContainer fluid>
        <CRow className="mb-4">
          <CCol>
            <h1 className="h3">Feedback</h1>
            <p className="text-medium-emphasis">
              Cuéntanos tus sugerencias o reporta un problema. ¡Tu opinión nos ayuda a mejorar!
            </p>
          </CCol>
        </CRow>
        <CRow>
          <CCol md={6} aria-label="Formulario de Feedback">
            {/* TODO: FeedbackForm (texto libre, email opcional, categoría) */}
          </CCol>
          <CCol md={6} aria-label="Listado de feedback enviado">
            {/* TODO: FeedbackList (opcional) */}
          </CCol>
        </CRow>
      </CContainer>
    </main>
  )
}

export default Feedback
