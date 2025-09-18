// ReportsList.jsx - Listado de reportes disponibles
import React, { useMemo } from 'react'
import { CContainer, CRow, CCol, CCard, CCardBody, CCardHeader, CCardTitle, CButton, CListGroup, CListGroupItem, CAlert } from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import { cilDescription, cilChartLine, cilBuilding, cilUser, cilArrowLeft } from '@coreui/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useTemplatesModel } from '../hooks/useTemplatesModel'

const ReportsList = () => {
  const { reports, templates } = useTemplatesModel()
  const navigate = useNavigate()

  // Mock reports data - these are always available
  const mockReports = useMemo(() => [
    {
      id: 'mock-duolingo-growth-report',
      name: 'Duolingo Growth Signal Report',
      description: 'Comprehensive growth analysis for the language learning platform including market position, user acquisition, and competitive landscape.',
      category: 'EdTech',
      metrics: {
        mau: '70M+',
        revenue: '$250M',
        growth: '+22% YoY',
        marketPosition: '#1 in category'
      },
      icon: cilUser,
      color: 'success',
      isMock: true,
      templateName: 'Duolingo Analysis',
      sectionCount: 5
    },
    {
      id: 'mock-calvinklein-growth-report',
      name: 'Calvin Klein Growth Signal Report',
      description: 'Detailed brand analysis for the fashion company covering digital transformation, sustainability initiatives, and luxury market positioning.',
      category: 'Fashion',
      metrics: {
        revenue: '$2.8B',
        digitalSales: '35%',
        countries: '120+',
        growth: '+8% YoY'
      },
      icon: cilBuilding,
      color: 'primary',
      isMock: true,
      templateName: 'Calvin Klein Analysis',
      sectionCount: 5
    }
  ], [])

  // Available reports from the system
  const availableReports = useMemo(() => {
    return reports.map(report => {
      const template = templates.find(t => t.id === report.templateId)
      return {
        id: report.id,
        name: report.name || template?.name || 'Sin nombre',
        description: `Reporte basado en el template "${template?.name || 'Sin nombre'}"`,
        category: 'Custom',
        templateName: template?.name,
        createdAt: report.updatedAt,
        sectionCount: report.sections?.length || 0,
        icon: cilDescription,
        color: 'info'
      }
    })
  }, [reports, templates])

  const allReports = [...mockReports, ...availableReports]

  const handleReportClick = (report) => {
    // For mock reports, navigate directly to mock report view
    if (report.isMock) {
      navigate(`/report/view/${report.id}`)
    } else {
      // For custom reports, navigate to the report viewer
      navigate(`/report/view/${report.id}`)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <CContainer fluid>
      <CRow className="mb-4">
        <CCol>
          <h1 className="h3">Reportes Disponibles</h1>
          <p className="text-medium-emphasis">Explora y accede a todos los reportes de análisis disponibles en el sistema.</p>
        </CCol>
      </CRow>

      <CRow>
        {allReports.map((report) => (
          <CCol md={6} lg={4} key={report.id} className="mb-4">
            <CCard className="h-100">
              <CCardHeader className={`bg-${report.color} text-white`}>
                <div className="d-flex align-items-center">
                  <CIcon icon={report.icon} size="lg" className="me-2" />
                  <div>
                    <CCardTitle className="mb-0 text-white">{report.name}</CCardTitle>
                    <small className="text-white-50">{report.category}</small>
                  </div>
                </div>
              </CCardHeader>
              <CCardBody className="d-flex flex-column">
                <p className="text-medium-emphasis mb-3">{report.description}</p>

                {/* Metrics */}
                {report.metrics && (
                  <div className="mb-3">
                    <small className="text-muted d-block mb-2">Métricas clave:</small>
                    <div className="d-flex flex-wrap gap-2">
                      {Object.entries(report.metrics).map(([key, value]) => (
                        <span key={key} className={`badge bg-${report.color}-light text-${report.color}`}>
                          {key.toUpperCase()}: {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional info for custom reports */}
                {report.templateName && (
                  <div className="mb-3">
                    <small className="text-muted">
                      Template: <strong>{report.templateName}</strong><br/>
                      Secciones: <strong>{report.sectionCount}</strong><br/>
                      Actualizado: <strong>{formatDate(report.createdAt)}</strong>
                    </small>
                  </div>
                )}

                <div className="mt-auto">
                  <CButton
                    color={report.color}
                    className="w-100"
                    onClick={() => handleReportClick(report)}
                  >
                    <CIcon icon={cilChartLine} className="me-2" />
                    {report.id === 'duolingo-growth-report' || report.id === 'calvinklein-growth-report' ? 'Crear Reporte' : 'Ver Reporte'}
                  </CButton>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      {allReports.length === 0 && (
        <CRow>
          <CCol className="text-center py-5">
            <CIcon icon={cilDescription} size="4xl" className="text-muted mb-3" />
            <h4>No hay reportes disponibles</h4>
            <p className="text-medium-emphasis">Los reportes aparecerán aquí una vez que sean creados.</p>
          </CCol>
        </CRow>
      )}

      {/* Summary stats */}
      <CRow className="mt-4">
        <CCol>
          <CCard>
            <CCardBody>
              <CRow className="text-center">
                <CCol md={3}>
                  <h4 className="text-primary">{allReports.length}</h4>
                  <small className="text-muted">Reportes Totales</small>
                </CCol>
                <CCol md={3}>
                  <h4 className="text-success">{mockReports.length}</h4>
                  <small className="text-muted">Reportes de Muestra</small>
                </CCol>
                <CCol md={3}>
                  <h4 className="text-info">{availableReports.length}</h4>
                  <small className="text-muted">Reportes Personalizados</small>
                </CCol>
                <CCol md={3}>
                  <h4 className="text-warning">{allReports.reduce((acc, r) => acc + (r.sectionCount || 0), 0)}</h4>
                  <small className="text-muted">Secciones Totales</small>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default ReportsList
