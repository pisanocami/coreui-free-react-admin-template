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

const ReportMedia = () => {
  const [media, setMedia] = useState([])
  const [reports, setReports] = useState([])
  const [sections, setSections] = useState([])
  const [visible, setVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentMedium, setCurrentMedium] = useState({ reportid: '', sectionid: '', type: '', url: '', caption: '', filesize: '' })

  const fetchMedia = () => {
    fetch('/api/reportmedia')
      .then((response) => response.json())
      .then((data) => setMedia(data))
      .catch((error) => console.error('Error fetching report media:', error))
  }

  const fetchRelatedData = async () => {
    try {
      const [reportsRes, sectionsRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/reportsections'),
      ])
      const reportsData = await reportsRes.json()
      const sectionsData = await sectionsRes.json()
      setReports(reportsData)
      setSections(sectionsData)
    } catch (error) {
      console.error('Error fetching related data:', error)
    }
  }

  useEffect(() => {
    fetchMedia()
    fetchRelatedData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentMedium({ ...currentMedium, [name]: value })
  }

  const handleSaveMedium = () => {
    const method = isEditMode ? 'PUT' : 'POST'
    const url = isEditMode ? `/api/reportmedia/${currentMedium.mediaid}` : '/api/reportmedia'

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentMedium),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error) })
        }
        return response.status === 204 ? null : response.json()
      })
      .then(() => {
        fetchMedia()
        setVisible(false)
      })
      .catch((error) => console.error(`Error ${isEditMode ? 'updating' : 'adding'} report medium:`, error.message))
  }

  const openModalForCreate = () => {
    setIsEditMode(false)
    setCurrentMedium({ reportid: '', sectionid: '', type: '', url: '', caption: '', filesize: '' })
    setVisible(true)
  }

  const openModalForEdit = (medium) => {
    setIsEditMode(true)
    setCurrentMedium(medium)
    setVisible(true)
  }

  const handleDeleteMedium = (mediaid) => {
    if (window.confirm('Are you sure you want to delete this report medium?')) {
      fetch(`/api/reportmedia/${mediaid}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete report medium')
          }
          fetchMedia()
        })
        .catch(error => console.error('Error deleting report medium:', error.message))
    }
  }

  const reportNameMap = reports.reduce((acc, report) => ({ ...acc, [report.reportid]: report.name }), {})
  const sectionNameMap = sections.reduce((acc, section) => ({ ...acc, [section.sectionid]: section.sectionname }), {})

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Report Media</h1>
        <CButton color="primary" onClick={openModalForCreate}>
          Add Report Medium
        </CButton>
      </div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Type</CTableHeaderCell>
            <CTableHeaderCell>URL</CTableHeaderCell>
            <CTableHeaderCell>Report</CTableHeaderCell>
            <CTableHeaderCell>Section</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {media.map((item) => (
            <CTableRow key={item.mediaid}>
              <CTableDataCell>{item.mediaid}</CTableDataCell>
              <CTableDataCell>{item.type}</CTableDataCell>
              <CTableDataCell>{item.url}</CTableDataCell>
              <CTableDataCell>{reportNameMap[item.reportid] || item.reportid}</CTableDataCell>
              <CTableDataCell>{sectionNameMap[item.sectionid] || 'N/A'}</CTableDataCell>
              <CTableDataCell>
                <CButton color="light" size="sm" onClick={() => openModalForEdit(item)} className="me-2">
                  Edit
                </CButton>
                <CButton color="danger" size="sm" onClick={() => handleDeleteMedium(item.mediaid)}>
                  Delete
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>{isEditMode ? 'Edit Report Medium' : 'Add New Report Medium'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect name="reportid" label="Report" value={currentMedium.reportid || ''} onChange={handleInputChange} className="mb-3">
              <option>Select Report</option>
              {reports.map((r) => (<option key={r.reportid} value={r.reportid}>{r.name}</option>))}
            </CFormSelect>
            <CFormSelect name="sectionid" label="Section (Optional)" value={currentMedium.sectionid || ''} onChange={handleInputChange} className="mb-3">
              <option value="">Select Section</option>
              {sections.map((s) => (<option key={s.sectionid} value={s.sectionid}>{s.sectionname}</option>))}
            </CFormSelect>
            <CFormInput type="text" name="type" label="Type" value={currentMedium.type || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="url" label="URL" value={currentMedium.url || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="caption" label="Caption" value={currentMedium.caption || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="number" name="filesize" label="File Size (bytes)" value={currentMedium.filesize || ''} onChange={handleInputChange} />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleSaveMedium}>{isEditMode ? 'Update Medium' : 'Save Medium'}</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default ReportMedia
