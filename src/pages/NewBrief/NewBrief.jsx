import React from 'react'
import { CContainer, CRow, CCol } from '@coreui/react'

const NewBrief = () => {
  return (
    <main aria-label="Contenido principal: Nuevo Brief">
      <CContainer fluid>
        <CRow className="mb-4">
          <CCol>
            <h1 className="h3">Nuevo Brief</h1>
            <p className="text-medium-emphasis">Completa el formulario para crear un brief de proyecto.</p>
          </CCol>
        </CRow>
        <CRow>
          <CCol md={6} aria-label="Formulario de brief">
            {/* TODO: NewBriefForm con validación en tiempo real */}
          </CCol>
          <CCol md={6} aria-label="Vista previa del brief">
            {/* TODO: BriefPreview que se actualiza en tiempo real */}
          </CCol>
        </CRow>
      </CContainer>
    </main>
  )
}

export default NewBrief
