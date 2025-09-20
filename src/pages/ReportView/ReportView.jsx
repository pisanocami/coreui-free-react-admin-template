import React, { useState, useEffect } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CFormSelect,
  CSpinner,
  CAlert,
  CButton,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilChartLine, cilDescription, cilMagnifyingGlass } from '@coreui/icons'

const ReportView = () => {
  const [reports, setReports] = useState([])
  const [selectedReportId, setSelectedReportId] = useState('')
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const [activeCentralTab, setActiveCentralTab] = useState('vision')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])

  // Fetch all reports for the dropdown
  const fetchReports = () => {
    fetch('/api/reports')
      .then((response) => response.json())
      .then((data) => setReports(data))
      .catch((error) => console.error('Error fetching reports:', error))
  }

  // Fetch detailed report data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchTerm.trim() || !reportData) return
    
    const results = []
    reportData.sections.forEach((section, sectionIndex) => {
      // Buscar en descripción de sección
      if (section.description && section.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push({
          sectionIndex,
          sectionName: section.sectionname,
          type: 'Descripción de sección',
          content: section.description
        })
      }
      
      // Buscar en items de sección
      section.items.forEach(item => {
        if (item.itemtitle && item.itemtitle.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            sectionIndex,
            sectionName: section.sectionname,
            type: 'Item',
            content: item.itemtitle
          })
        }
        if (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            sectionIndex,
            sectionName: section.sectionname,
            type: 'Contenido de item',
            content: item.content
          })
        }
      })
      
      // Buscar en insights
      section.insights.forEach(insight => {
        if (insight.title && insight.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            sectionIndex,
            sectionName: section.sectionname,
            type: 'Insight',
            content: insight.title
          })
        }
        if (insight.content && insight.content.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            sectionIndex,
            sectionName: section.sectionname,
            type: 'Contenido de insight',
            content: insight.content
          })
        }
      })
      
      // Buscar en media
      section.media.forEach(media => {
        if (media.caption && media.caption.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            sectionIndex,
            sectionName: section.sectionname,
            type: 'Media',
            content: media.caption
          })
        }
      })
    })
    
    setSearchResults(results)
  }

  const fetchReportData = (reportId) => {
    if (!reportId) return
    
    setLoading(true)
    setError('')
    
    // Fetch report sections
    fetch(`/api/reports/${reportId}/sections`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch report sections')
        }
        return response.json()
      })
      .then((sections) => {
        // Fetch all related data for each section
        const sectionsWithDetails = sections.map(section => {
          return Promise.all([
            // Fetch section items
            fetch(`/api/report-sections/${section.sectionid}/items`)
              .then(res => res.json())
              .catch(() => []),
            // Fetch insights
            fetch(`/api/report-sections/${section.sectionid}/insights`)
              .then(res => res.json())
              .catch(() => []),
            // Fetch media
            fetch(`/api/report-sections/${section.sectionid}/media`)
              .then(res => res.json())
              .catch(() => [])
          ]).then(([items, insights, media]) => ({
            ...section,
            items,
            insights,
            media
          }))
        })
        
        return Promise.all(sectionsWithDetails)
      })
      .then((sections) => {
        setReportData({
          report: reports.find(r => r.reportid === parseInt(reportId)),
          sections
        })
        setLoading(false)
      })
      .catch((error) => {
        setError(error.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    fetchReportData(selectedReportId)
  }, [selectedReportId])

  return (
    <CContainer>
      <CRow>
        <CCol xs={12}>
          <h1>Visualización de Reportes</h1>
          <p className="text-medium-emphasis">Selecciona un reporte para visualizar su contenido completo</p>
        </CCol>
      </CRow>
      
      <CRow className="mb-4">
        <CCol xs={12} md={6}>
          <CFormSelect
            value={selectedReportId}
            onChange={(e) => setSelectedReportId(e.target.value)}
            disabled={loading}
          >
            <option value="">Selecciona un reporte</option>
            {reports.map((report) => (
              <option key={report.reportid} value={report.reportid}>
                {report.name}
              </option>
            ))}
          </CFormSelect>
        </CCol>
      </CRow>
      
      {error && (
        <CRow>
          <CCol xs={12}>
            <CAlert color="danger">{error}</CAlert>
          </CCol>
        </CRow>
      )}
      
      {loading && (
        <CRow>
          <CCol xs={12} className="text-center">
            <CSpinner />
          </CCol>
        </CRow>
      )}
      
      {reportData && (
        <CRow>
          {/* Panel izquierdo */}
          <CCol md={3}>
            <CCard className="mb-4">
              <CCardHeader>
                <h5>Reporte</h5>
              </CCardHeader>
              <CCardBody>
                <div className="d-grid gap-2">
                  <CButton color="primary" variant="outline" className="text-start mb-2">
                    <CIcon icon={cilDescription} className="me-2" />
                    Summaries
                  </CButton>
                  <CButton color="primary" variant="outline" className="text-start mb-2">
                    <CIcon icon={cilDescription} className="me-2" />
                    Versión
                  </CButton>
                  <CButton color="primary" variant="outline" className="text-start mb-2">
                    <CIcon icon={cilDescription} className="me-2" />
                    Estados
                  </CButton>
                  <CButton color="primary" variant="outline" className="text-start mb-2">
                    <CIcon icon={cilDescription} className="me-2" />
                    Fechas
                  </CButton>
                </div>
              </CCardBody>
            </CCard>
            
            <CCard className="mb-4">
              <CCardHeader>
                <h5>Árbol del Reporte</h5>
              </CCardHeader>
              <CCardBody>
                <CNav variant="pills" className="flex-column">
                  {reportData.sections.map((section, index) => (
                    <CNavItem key={section.sectionid}>
                      <CNavLink
                        active={activeTab === index}
                        onClick={() => setActiveTab(index)}
                        className="text-start"
                      >
                        {section.sectionname}
                      </CNavLink>
                    </CNavItem>
                  ))}
                </CNav>
              </CCardBody>
            </CCard>
          </CCol>
          
          {/* Panel central */}
          <CCol md={6}>
            <CCard className="mb-4">
              <CCardHeader>
                <CNav variant="tabs" role="tablist">
                  <CNavItem>
                    <CNavLink 
                      active={activeCentralTab === 'vision'}
                      onClick={() => setActiveCentralTab('vision')}
                      role="tab"
                      aria-selected={activeCentralTab === 'vision'}
                    >
                      Visión General
                    </CNavLink>
                  </CNavItem>
                  <CNavItem>
                    <CNavLink 
                      active={activeCentralTab === 'secciones'}
                      onClick={() => setActiveCentralTab('secciones')}
                      role="tab"
                      aria-selected={activeCentralTab === 'secciones'}
                    >
                      Secciones
                    </CNavLink>
                  </CNavItem>
                  <CNavItem>
                    <CNavLink 
                      active={activeCentralTab === 'kpis'}
                      onClick={() => setActiveCentralTab('kpis')}
                      role="tab"
                      aria-selected={activeCentralTab === 'kpis'}
                    >
                      KPIs
                    </CNavLink>
                  </CNavItem>
                  <CNavItem>
                    <CNavLink 
                      active={activeCentralTab === 'competencia'}
                      onClick={() => setActiveCentralTab('competencia')}
                      role="tab"
                      aria-selected={activeCentralTab === 'competencia'}
                    >
                      Competencia
                    </CNavLink>
                  </CNavItem>
                </CNav>
              </CCardHeader>
              <CCardBody>
                {/* Contenido de Visión General */}
                <CTabContent>
                  <CTabPane visible={activeCentralTab === 'vision'}>
                    <div className="mb-4">
                      <h5>Resumen Ejecutivo</h5>
                      <CCard>
                        <CCardBody>
                          <p>Contenido del resumen ejecutivo del reporte</p>
                        </CCardBody>
                      </CCard>
                    </div>
                    
                    <div className="mb-4">
                      <h5>Información General</h5>
                      <CCard>
                        <CCardBody>
                          <p>Contenido de información general del reporte</p>
                        </CCardBody>
                      </CCard>
                    </div>
                  </CTabPane>
                  
                  {/* Contenido de Secciones */}
                  <CTabPane visible={activeCentralTab === 'secciones'}>
                    <div className="mb-4">
                      <h5>Secciones del Reporte</h5>
                      <CCard>
                        <CCardBody>
                          <p>Contenido de secciones del reporte</p>
                        </CCardBody>
                      </CCard>
                    </div>
                  </CTabPane>
                  
                  {/* Contenido de KPIs */}
                  <CTabPane visible={activeCentralTab === 'kpis'}>
                    <div className="mb-4">
                      <h5>KPIs del Reporte</h5>
                      <CCard>
                        <CCardBody>
                          <p>Contenido de KPIs del reporte</p>
                        </CCardBody>
                      </CCard>
                    </div>
                  </CTabPane>
                  
                  {/* Contenido de Competencia */}
                  <CTabPane visible={activeCentralTab === 'competencia'}>
                    <div className="mb-4">
                      <h5>Análisis de Competencia</h5>
                      <CCard>
                        <CCardBody>
                          <p>Contenido de análisis de competencia</p>
                        </CCardBody>
                      </CCard>
                    </div>
                  </CTabPane>
                </CTabContent>
              </CCardBody>
            </CCard>
            
            {/* Sección inferior con tablas y visualizaciones */}
            <CCard className="mb-4">
              <CCardBody>
                <CRow>
                  <CCol md={6}>
                    <h5>Tablas exportables</h5>
                    <CCard>
                      <CCardBody>
                        <p>Contenido de tablas exportables</p>
                      </CCardBody>
                    </CCard>
                  </CCol>
                  <CCol md={6}>
                    <h5>Ranking Competidor</h5>
                    <CCard>
                      <CCardBody>
                        <p>Contenido de ranking competidor</p>
                      </CCardBody>
                    </CCard>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
          
          {/* Panel derecho */}
          <CCol md={3}>
            <CCard className="mb-4">
              <CCardHeader>
                <h5>Insights Clave</h5>
              </CCardHeader>
              <CCardBody>
                <p>Contenido de insights clave</p>
              </CCardBody>
            </CCard>
            
            <CCard className="mb-4">
              <CCardHeader>
                <h5>Comentarios</h5>
              </CCardHeader>
              <CCardBody>
                <p>Contenido de comentarios</p>
              </CCardBody>
            </CCard>
            
            <CCard className="mb-4">
              <CCardHeader>
                <h5>Historial</h5>
              </CCardHeader>
              <CCardBody>
                <p>Contenido de historial</p>
              </CCardBody>
            </CCard>
            
            <CCard className="mb-4">
              <CCardHeader>
                <h5>Citaciones</h5>
              </CCardHeader>
              <CCardBody>
                <p>Contenido de citaciones</p>
              </CCardBody>
            </CCard>
            
            <CCard className="mb-4">
              <CCardHeader>
                <h5>Medios</h5>
              </CCardHeader>
              <CCardBody>
                <p>Contenido de medios</p>
              </CCardBody>
            </CCard>
            
            <CCard className="mb-4">
              <CCardHeader>
                <h5>Adjuntos</h5>
              </CCardHeader>
              <CCardBody>
                <p>Contenido de adjuntos</p>
              </CCardBody>
            </CCard>
            
            <CCard className="mb-4">
              <CCardHeader>
                <h5>Preview</h5>
              </CCardHeader>
              <CCardBody>
                <p>Contenido de preview</p>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}
    </CContainer>
  )
}

export default ReportView
