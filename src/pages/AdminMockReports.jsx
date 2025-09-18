// Admin component to populate mock report data
import React from 'react'
import { CContainer, CRow, CCol, CButton, CCard, CCardBody, CCardHeader, CCardTitle } from '@coreui/react'
import { useTemplatesModel } from '../hooks/useTemplatesModel'
import { duolingoMockData, calvinkleinMockData } from '../../tools/mock-report-data.js'

const AdminMockReports = () => {
  const {
    templates,
    reports,
    setState,
    createTemplate,
    createSection,
    createReport,
    updateReportSection,
    sectionsCatalog
  } = useTemplatesModel()

  const createMockReport = async (mockData) => {
    try {
      // Step 1: Create template (this also sets it as current)
      createTemplate(mockData.templateName)

      // Wait a bit for state to update
      await new Promise(resolve => setTimeout(resolve, 100))

      // Step 2: Get the newly created template ID
      const newTemplate = templates.find(t => t.name === mockData.templateName)
      if (!newTemplate) {
        throw new Error('Template creation failed')
      }

      // Step 3: Clear existing sections and add our custom ones
      // First, create new sections in catalog if needed
      const sectionIds = []
      for (const section of mockData.sections) {
        const sectionId = createSection({
          key: section.title.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          defaultNumber: section.number || '',
          defaultTitle: section.title,
          description: `Section for ${mockData.templateName}`,
          usesPrompt: false,
          promptText: ''
        })
        sectionIds.push(sectionId)
      }

      // Wait for sections to be created
      await new Promise(resolve => setTimeout(resolve, 100))

      // Step 4: Update template with our section IDs
      // Since createTemplate already adds all sections, we need to replace them
      setState(prev => ({
        ...prev,
        templates: prev.templates.map(t =>
          t.id === newTemplate.id
            ? { ...t, sectionIds }
            : t
        )
      }))

      // Wait for template update
      await new Promise(resolve => setTimeout(resolve, 100))

      // Step 5: Create report
      createReport(newTemplate.id, `${mockData.templateName} - Generated Report`)

      // Wait for report creation
      await new Promise(resolve => setTimeout(resolve, 100))

      // Step 6: Get the newly created report and populate with content
      const newReport = reports.find(r => r.templateId === newTemplate.id && r.name.includes('Generated Report'))
      if (!newReport) {
        throw new Error('Report creation failed')
      }

      // Step 7: Populate report sections with mock content
      mockData.sections.forEach((sectionData, index) => {
        if (index < newReport.sections.length) {
          updateReportSection(newReport.id, index, {
            number: sectionData.number,
            title: sectionData.title,
            content: sectionData.content,
            link: '',
            attachments: sectionData.attachments || []
          })
        }
      })

      alert(`Mock report "${mockData.templateName}" created successfully!`)
    } catch (error) {
      console.error('Error creating mock report:', error)
      alert(`Error creating mock report: ${error.message}`)
    }
  }

  return (
    <CContainer fluid>
      <CRow className="mb-4">
        <CCol>
          <h1 className="h3">Admin - Create Mock Reports</h1>
          <p className="text-medium-emphasis">Generate sample reports with realistic content for testing and demonstration.</p>
        </CCol>
      </CRow>

      <CRow>
        <CCol md={6}>
          <CCard>
            <CCardHeader>
              <CCardTitle>Duolingo Growth Report</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <p>Create a comprehensive growth report for Duolingo with realistic metrics, market analysis, and strategic insights for the language learning platform.</p>
              <CButton
                color="primary"
                onClick={() => createMockReport(duolingoMockData)}
              >
                Create Duolingo Mock Report
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={6}>
          <CCard>
            <CCardHeader>
              <CCardTitle>Calvin Klein Growth Report</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <p>Create a detailed growth report for Calvin Klein with brand analysis, market positioning, and fashion industry insights.</p>
              <CButton
                color="success"
                onClick={() => createMockReport(calvinkleinMockData)}
              >
                Create Calvin Klein Mock Report
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="mt-4">
        <CCol>
          <CCard>
            <CCardHeader>
              <CCardTitle>Instructions</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <ol>
                <li>Click on either button above to create a mock report</li>
                <li>The system will create a new template with relevant sections</li>
                <li>A report will be generated with realistic content and metrics</li>
                <li>You can then view and edit the report in the Report Builder</li>
                <li>Use the mock data to test features like PDF export and content generation</li>
              </ol>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default AdminMockReports
