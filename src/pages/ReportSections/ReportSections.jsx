import React, { useState, useEffect } from 'react'
import {
  CContainer,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
} from '@coreui/react'

const ReportSections = () => {
  const [sections, setSections] = useState([])
  const [reports, setReports] = useState([])
  const [visible, setVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentSection, setCurrentSection] = useState({ reportid: '', sectionname: '', position: '', description: '' })

  const fetchSections = () => {
    fetch('/api/reportsections')
      .then((response) => response.json())
      .then((data) => setSections(data))
      .catch((error) => console.error('Error fetching report sections:', error))
  }

  const fetchReports = () => {
    fetch('/api/reports')
      .then((response) => response.json())
      .then((data) => setReports(data))
      .catch((error) => console.error('Error fetching reports:', error))
  }

  useEffect(() => {
    fetchSections()
    fetchReports()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentSection({ ...currentSection, [name]: value })
  }

  const handleSaveSection = () => {
    const method = isEditMode ? 'PUT' : 'POST'
    const url = isEditMode ? `/api/reportsections/${currentSection.sectionid}` : '/api/reportsections'

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentSection),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error) })
        }
        return response.status === 204 ? null : response.json()
      })
      .then(() => {
        fetchSections()
        setVisible(false)
      })
      .catch((error) => console.error(`Error ${isEditMode ? 'updating' : 'adding'} report section:`, error.message))
  }

  const openModalForCreate = () => {
    setIsEditMode(false)
    setCurrentSection({ reportid: '', sectionname: '', position: '', description: '' })
    setVisible(true)
  }

  const openModalForEdit = (section) => {
    setIsEditMode(true)
    setCurrentSection(section)
    setVisible(true)
  }

  const handleDeleteSection = (sectionid) => {
    if (window.confirm('Are you sure you want to delete this report section?')) {
      fetch(`/api/reportsections/${sectionid}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete report section')
          }
          fetchSections()
        })
        .catch(error => console.error('Error deleting report section:', error.message))
    }
  }

  const reportNameMap = reports.reduce((acc, report) => ({ ...acc, [report.reportid]: report.name }), {})

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Report Sections</h1>
        <CButton color="primary" onClick={openModalForCreate}>
          Add Report Section
        </CButton>
      </div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Section Name</CTableHeaderCell>
            <CTableHeaderCell>Report</CTableHeaderCell>
            <CTableHeaderCell>Position</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {sections.map((section) => (
            <CTableRow key={section.sectionid}>
              <CTableDataCell>{section.sectionid}</CTableDataCell>
              <CTableDataCell>{section.sectionname}</CTableDataCell>
              <CTableDataCell>{reportNameMap[section.reportid] || section.reportid}</CTableDataCell>
              <CTableDataCell>{section.position}</CTableDataCell>
              <CTableDataCell>
                <CButton color="light" size="sm" onClick={() => openModalForEdit(section)} className="me-2">
                  Edit
                </CButton>
                <CButton color="danger" size="sm" onClick={() => handleDeleteSection(section.sectionid)}>
                  Delete
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>{isEditMode ? 'Edit Report Section' : 'Add New Report Section'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect name="reportid" label="Report" value={currentSection.reportid || ''} onChange={handleInputChange} className="mb-3">
              <option>Select Report</option>
              {reports.map((r) => (<option key={r.reportid} value={r.reportid}>{r.name}</option>))}
            </CFormSelect>
            <CFormInput type="text" name="sectionname" label="Section Name" value={currentSection.sectionname || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="number" name="position" label="Position" value={currentSection.position || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="description" label="Description" value={currentSection.description || ''} onChange={handleInputChange} />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleSaveSection}>{isEditMode ? 'Update Section' : 'Save Section'}</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default ReportSections
