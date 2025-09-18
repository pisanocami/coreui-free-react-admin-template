import React from 'react'
import { CContainer, CRow, CCol, CForm, CFormLabel, CFormInput, CButton, CAlert, CCard, CCardBody } from '@coreui/react'
import { getOpenAIToken, setOpenAIToken, testOpenAIConnection } from '../../services/openaiClient'

const Profile = () => {
  const [token, setToken] = React.useState('')
  const [status, setStatus] = React.useState({ type: 'idle', message: '' })

  React.useEffect(() => {
    setToken(getOpenAIToken())
  }, [])

  const handleSave = (e) => {
    e.preventDefault()
    try {
      setOpenAIToken(token)
      setStatus({ type: 'success', message: 'Token guardado localmente (localStorage).' })
    } catch (err) {
      setStatus({ type: 'error', message: err.message || String(err) })
    }
  }

  const handleTest = async () => {
    setStatus({ type: 'loading', message: 'Probando conexión con OpenAI…' })
    const res = await testOpenAIConnection()
    if (res.ok) {
      setStatus({ type: 'success', message: `Conexión OK. Respuesta: ${res.message}` })
    } else {
      setStatus({ type: 'error', message: `Fallo en la conexión: ${res.error}` })
    }
  }

  return (
    <main aria-label="Contenido principal: Perfil de usuario">
      <CContainer fluid>
        <CRow className="mb-4">
          <CCol>
            <h1 className="h3">Perfil</h1>
            <p className="text-medium-emphasis">Administra tu información básica y configuración de OpenAI.</p>
          </CCol>
        </CRow>
        <CRow>
          <CCol md={6} aria-label="Configuración de OpenAI">
            <CCard>
              <CCardBody>
                <h2 className="h5 mb-3">OpenAI</h2>
                <p className="text-medium-emphasis small">
                  El token se almacena en <code>localStorage</code> del navegador. Para producción, se recomienda usar un backend proxy y nunca exponer el token en el frontend.
                </p>
                <CForm onSubmit={handleSave} className="mb-3">
                  <CFormLabel htmlFor="openai-token">API Token</CFormLabel>
                  <CFormInput
                    id="openai-token"
                    type="password"
                    autoComplete="off"
                    placeholder="sk-..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    aria-label="Token de OpenAI"
                  />
                  <div className="d-flex gap-2 mt-3">
                    <CButton color="primary" type="submit">Guardar</CButton>
                    <CButton color="secondary" type="button" onClick={handleTest} disabled={!token}>Probar conexión</CButton>
                  </div>
                </CForm>
                {status.type !== 'idle' && (
                  <CAlert color={status.type === 'success' ? 'success' : status.type === 'error' ? 'danger' : 'info'}>
                    {status.message}
                  </CAlert>
                )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </main>
  )
}

export default Profile
