import React from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
  CAlert,
  CCard,
  CCardBody,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import { Providers, getCurrentProvider, setCurrentProvider, getToken, setToken as setAIPToken, testConnection } from '../../services/aiProvider'

const Profile = () => {
  const [provider, setProvider] = React.useState(Providers.OpenAI)
  const [token, setToken] = React.useState('')
  const [showToken, setShowToken] = React.useState(false)
  const [status, setStatus] = React.useState({ type: 'idle', message: '' })

  React.useEffect(() => {
    const p = getCurrentProvider()
    setProvider(p)
    setToken(getToken(p))
  }, [])

  const handleSave = (e) => {
    e.preventDefault()
    try {
      setCurrentProvider(provider)
      setAIPToken(token, provider)
      setStatus({ type: 'success', message: 'API Key guardada localmente (localStorage).' })
    } catch (err) {
      setStatus({ type: 'error', message: err.message || String(err) })
    }
  }

  const handleTest = async () => {
    setStatus({ type: 'loading', message: 'Probando conexión con OpenAI…' })
    const res = await testConnection(provider)
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
            <p className="text-medium-emphasis">Administra tu información básica y configuración de IA.</p>
          </CCol>
        </CRow>
        <CRow>
          <CCol md={6} aria-label="Configuración de OpenAI">
            <CCard>
              <CCardBody>
                <h2 className="h5 mb-3">API Provider</h2>
                <p className="text-medium-emphasis small">El API Key se almacena en <code>localStorage</code>. Para producción, usa un backend proxy y nunca expongas la clave en el frontend.</p>
                <CForm onSubmit={handleSave} className="mb-3">
                  <CFormLabel htmlFor="ai-provider">API Provider</CFormLabel>
                  <CFormSelect
                    id="ai-provider"
                    value={provider}
                    onChange={(e) => {
                      const next = e.target.value
                      setProvider(next)
                      // Cargar el token relacionado con el provider en pantalla
                      setToken(getToken(next))
                    }}
                    aria-label="Seleccionar proveedor de IA"
                    className="mb-3"
                  >
                    <option value={Providers.OpenAI}>OpenAI</option>
                    <option value={Providers.Gemini}>Gemini</option>
                  </CFormSelect>

                  <CFormLabel htmlFor="ai-token">API Key</CFormLabel>
                  <CInputGroup>
                    <CFormInput
                      id="ai-token"
                      type={showToken ? 'text' : 'password'}
                      autoComplete="off"
                      placeholder={provider === Providers.OpenAI ? 'sk-...' : 'AIza...'}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      aria-label="API Key"
                    />
                    <CInputGroupText role="button" title={showToken ? 'Ocultar' : 'Mostrar'} onClick={() => setShowToken((v) => !v)}>
                      {showToken ? '🙈' : '👁️'}
                    </CInputGroupText>
                  </CInputGroup>
                  <div className="text-medium-emphasis small mt-1">Stored locally. Never sent to our servers.</div>

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

