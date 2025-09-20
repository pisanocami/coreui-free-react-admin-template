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
  const [newSection, setNewSection] = useState({
    reportid: '',
    sectionname: '',
    position: '',
    description: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectionsRes, reportsRes] = await Promise.all([
          fetch('/api/reportsections'),
          fetch('/api/reports'),
        ])
        const sectionsData = await sectionsRes.json()
        const reportsData = await reportsRes.json()
        setSections(sectionsData)
        setReports(reportsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewSection({ ...newSection, [name]: value })
  }

  const handleAddSection = () => {
    const sectionData = {
      ...newSection,
      reportid: parseInt(newSection.reportid, 10),
      position: newSection.position ? parseInt(newSection.position, 10) : null,
    }

    fetch('/api/reportsections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sectionData),
    })
      .then((response) => response.json())
      .then((addedSection) => {
        if (addedSection.error) {
          alert(`Error: ${addedSection.error}`)
        } else {
          fetch('/api/reportsections').then((res) => res.json()).then(setSections)
          setVisible(false)
          setNewSection({ reportid: '', sectionname: '', position: '', description: '' })
        }
      })
      .catch((error) => console.error('Error adding report section:', error))
  }

  const reportNameMap = reports.reduce((acc, report) => ({ ...acc, [report.reportid]: report.name }), {})

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Report Sections</h1>
        <CButton color="primary" onClick={() => setVisible(!visible)}>
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
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {sections.map((section) => (
            <CTableRow key={section.sectionid}>
              <CTableDataCell>{section.sectionid}</CTableDataCell>
              <CTableDataCell>{section.sectionname}</CTableDataCell>
              <CTableDataCell>{reportNameMap[section.reportid] || section.reportid}</CTableDataCell>
              <CTableDataCell>{section.position}</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Add New Report Section</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect name="reportid" label="Report" value={newSection.reportid} onChange={handleInputChange} className="mb-3">
              <option>Select Report</option>
              {reports.map((r) => (<option key={r.reportid} value={r.reportid}>{r.name}</option>))}
            </CFormSelect>
            <CFormInput type="text" name="sectionname" label="Section Name" value={newSection.sectionname} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="number" name="position" label="Position" value={newSection.position} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="description" label="Description" value={newSection.description} onChange={handleInputChange} />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleAddSection}>Save Section</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default ReportSections
