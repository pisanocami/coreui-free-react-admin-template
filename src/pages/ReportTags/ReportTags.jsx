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
  CFormSelect,
} from '@coreui/react'

const ReportTags = () => {
  const [reportTags, setReportTags] = useState([])
  const [reports, setReports] = useState([])
  const [tags, setTags] = useState([])
  const [visible, setVisible] = useState(false)
  const [newReportTag, setNewReportTag] = useState({ reportid: '', tagid: '' })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportTagsRes, reportsRes, tagsRes] = await Promise.all([
          fetch('/api/reporttags'),
          fetch('/api/reports'),
          fetch('/api/tags'),
        ])
        const reportTagsData = await reportTagsRes.json()
        const reportsData = await reportsRes.json()
        const tagsData = await tagsRes.json()
        setReportTags(reportTagsData)
        setReports(reportsData)
        setTags(tagsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewReportTag({ ...newReportTag, [name]: value })
  }

  const handleAddReportTag = () => {
    const reportTagData = {
      reportid: parseInt(newReportTag.reportid, 10),
      tagid: parseInt(newReportTag.tagid, 10),
    }

    fetch('/api/reporttags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportTagData),
    })
      .then((response) => response.json())
      .then((addedReportTag) => {
        if (addedReportTag.error) {
          alert(`Error: ${addedReportTag.error}`)
        } else {
          fetch('/api/reporttags').then((res) => res.json()).then(setReportTags)
          setVisible(false)
          setNewReportTag({ reportid: '', tagid: '' })
        }
      })
      .catch((error) => console.error('Error adding report tag:', error))
  }

  const reportNameMap = reports.reduce((acc, report) => ({ ...acc, [report.reportid]: report.name }), {})
  const tagNameMap = tags.reduce((acc, tag) => ({ ...acc, [tag.tagid]: tag.name }), {})

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Report Tags</h1>
        <CButton color="primary" onClick={() => setVisible(!visible)}>
          Add Report Tag
        </CButton>
      </div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Report</CTableHeaderCell>
            <CTableHeaderCell>Tag</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {reportTags.map((rt, index) => (
            <CTableRow key={`${rt.reportid}-${rt.tagid}-${index}`}>
              <CTableDataCell>{reportNameMap[rt.reportid] || rt.reportid}</CTableDataCell>
              <CTableDataCell>{tagNameMap[rt.tagid] || rt.tagid}</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Add New Report Tag</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect name="reportid" label="Report" value={newReportTag.reportid} onChange={handleInputChange} className="mb-3">
              <option>Select Report</option>
              {reports.map((r) => (<option key={r.reportid} value={r.reportid}>{r.name}</option>))}
            </CFormSelect>
            <CFormSelect name="tagid" label="Tag" value={newReportTag.tagid} onChange={handleInputChange} className="mb-3">
              <option>Select Tag</option>
              {tags.map((t) => (<option key={t.tagid} value={t.tagid}>{t.name}</option>))}
            </CFormSelect>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleAddReportTag}>Save Report Tag</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default ReportTags
