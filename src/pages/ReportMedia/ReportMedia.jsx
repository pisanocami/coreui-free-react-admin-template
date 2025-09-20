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
  const [newMedium, setNewMedium] = useState({
    reportid: '',
    sectionid: '',
    type: '',
    url: '',
    caption: '',
    filesize: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mediaRes, reportsRes, sectionsRes] = await Promise.all([
          fetch('/api/reportmedia'),
          fetch('/api/reports'),
          fetch('/api/reportsections'),
        ])
        const mediaData = await mediaRes.json()
        const reportsData = await reportsRes.json()
        const sectionsData = await sectionsRes.json()
        setMedia(mediaData)
        setReports(reportsData)
        setSections(sectionsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewMedium({ ...newMedium, [name]: value })
  }

  const handleAddMedium = () => {
    const mediumData = {
      ...newMedium,
      reportid: parseInt(newMedium.reportid, 10),
      sectionid: newMedium.sectionid ? parseInt(newMedium.sectionid, 10) : null,
      filesize: newMedium.filesize ? parseInt(newMedium.filesize, 10) : null,
    }

    fetch('/api/reportmedia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mediumData),
    })
      .then((response) => response.json())
      .then((addedMedium) => {
        if (addedMedium.error) {
          alert(`Error: ${addedMedium.error}`)
        } else {
          fetch('/api/reportmedia').then((res) => res.json()).then(setMedia)
          setVisible(false)
          setNewMedium({ reportid: '', sectionid: '', type: '', url: '', caption: '', filesize: '' })
        }
      })
      .catch((error) => console.error('Error adding report medium:', error))
  }

  const reportNameMap = reports.reduce((acc, report) => ({ ...acc, [report.reportid]: report.name }), {})
  const sectionNameMap = sections.reduce((acc, section) => ({ ...acc, [section.sectionid]: section.sectionname }), {})

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Report Media</h1>
        <CButton color="primary" onClick={() => setVisible(!visible)}>
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
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {media.map((item) => (
            <CTableRow key={item.mediaid}>
              <CTableDataCell>{item.mediaid}</CTableDataCell>
              <CTableDataCell>{item.type}</CTableDataCell>
              <CTableDataCell>{item.url}</CTableDataCell>
              <CTableDataCell>{reportNameMap[item.reportid] || item.reportid}</CTableDataCell>
              <CTableDataCell>{sectionNameMap[item.sectionid] || item.sectionid}</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Add New Report Medium</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect name="reportid" label="Report" value={newMedium.reportid} onChange={handleInputChange} className="mb-3">
              <option>Select Report</option>
              {reports.map((r) => (<option key={r.reportid} value={r.reportid}>{r.name}</option>))}
            </CFormSelect>
            <CFormSelect name="sectionid" label="Section (Optional)" value={newMedium.sectionid} onChange={handleInputChange} className="mb-3">
              <option>Select Section</option>
              {sections.map((s) => (<option key={s.sectionid} value={s.sectionid}>{s.sectionname}</option>))}
            </CFormSelect>
            <CFormInput type="text" name="type" label="Type" value={newMedium.type} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="url" label="URL" value={newMedium.url} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="caption" label="Caption" value={newMedium.caption} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="number" name="filesize" label="File Size (bytes)" value={newMedium.filesize} onChange={handleInputChange} />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleAddMedium}>Save Medium</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default ReportMedia
