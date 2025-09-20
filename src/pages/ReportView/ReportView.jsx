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
  CAlert
} from '@coreui/react'

const ReportView = () => {
  const [reports, setReports] = useState([])
  const [selectedReportId, setSelectedReportId] = useState('')
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch all reports for the dropdown
  const fetchReports = () => {
    fetch('/api/reports')
      .then((response) => response.json())
      .then((data) => setReports(data))
      .catch((error) => console.error('Error fetching reports:', error))
  }

  // Fetch detailed report data
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
          <CCol xs={12}>
            <CCard className="mb-4">
              <CCardHeader>
                <h2>{reportData.report.name}</h2>
                <p className="text-medium-emphasis">Report ID: {reportData.report.reportid}</p>
              </CCardHeader>
              <CCardBody>
                {/* Aquí se mostraría el contenido completo del reporte */}
                <div className="report-content">
                  {reportData.sections.map((section) => (
                    <div key={section.sectionid} className="report-section mb-5">
                      <h3>{section.sectionname}</h3>
                      <p>{section.description}</p>
                      
                      {/* Items de sección */}
                      {section.items.length > 0 && (
                        <div className="section-items mt-3">
                          <h4>Items de Sección</h4>
                          {section.items.map((item) => (
                            <div key={item.itemid} className="section-item mb-3">
                              <h5>{item.itemtitle}</h5>
                              <p>{item.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Insights */}
                      {section.insights.length > 0 && (
                        <div className="section-insights mt-3">
                          <h4>Insights</h4>
                          {section.insights.map((insight) => (
                            <div key={insight.insightid} className="section-insight mb-3">
                              <h5>{insight.title}</h5>
                              <p>{insight.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Media */}
                      {section.media.length > 0 && (
                        <div className="section-media mt-3">
                          <h4>Media</h4>
                          {section.media.map((media) => (
                            <div key={media.mediaid} className="section-media-item mb-3">
                              <p>{media.caption}</p>
                              <a href={media.url} target="_blank" rel="noopener noreferrer">
                                {media.type}: {media.url}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}
    </CContainer>
  )
}

export default ReportView
