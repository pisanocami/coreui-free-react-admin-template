import React from 'react'
import { CContainer, CRow, CCol, CButton } from '@coreui/react'

const Dashboard = () => {
  return (
    <main aria-label="Contenido principal: Dashboard">
      <CContainer fluid>
        <CRow className="mb-4">
          <CCol>
            <h1 className="h3">Dashboard</h1>
            <p className="text-medium-emphasis">Resumen ejecutivo de proyectos activos.</p>
          </CCol>
          <CCol xs="12" sm="auto" className="text-sm-end">
            <CButton color="primary" href="#/brief/new" aria-label="Crear nuevo brief">
              Nuevo Brief
            </CButton>
          </CCol>
        </CRow>
        {/* TODO: ProjectsTable + ProjectFilters + indicadores de progreso */}
      </CContainer>
    </main>
  )
}

export default Dashboard
