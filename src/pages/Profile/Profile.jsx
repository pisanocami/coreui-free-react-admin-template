import React from 'react'
import { CContainer, CRow, CCol } from '@coreui/react'

const Profile = () => {
  return (
    <main aria-label="Contenido principal: Perfil de usuario">
      <CContainer fluid>
        <CRow className="mb-4">
          <CCol>
            <h1 className="h3">Perfil</h1>
            <p className="text-medium-emphasis">Administra tu información básica.</p>
          </CCol>
        </CRow>
        <CRow>
          <CCol md={6} aria-label="Formulario de perfil">
            {/* TODO: ProfileForm (nombre, email, avatar, etc.) */}
          </CCol>
        </CRow>
      </CContainer>
    </main>
  )
}

export default Profile
