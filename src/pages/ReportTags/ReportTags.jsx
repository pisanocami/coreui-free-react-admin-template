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

  const fetchReportTags = () => {
    fetch('/api/reporttags')
      .then((response) => response.json())
      .then((data) => setReportTags(data))
      .catch((error) => console.error('Error fetching report tags:', error))
  }

  const fetchRelatedData = async () => {
    try {
      const [reportsRes, tagsRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/tags'),
      ])
      const reportsData = await reportsRes.json()
      const tagsData = await tagsRes.json()
      setReports(reportsData)
      setTags(tagsData)
    } catch (error) {
      console.error('Error fetching related data:', error)
    }
  }

  useEffect(() => {
    fetchReportTags()
    fetchRelatedData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewReportTag({ ...newReportTag, [name]: value })
  }

  const handleAddReportTag = () => {
    fetch('/api/reporttags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newReportTag),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error) })
        }
        return response.json()
      })
      .then(() => {
        fetchReportTags()
        setVisible(false)
        setNewReportTag({ reportid: '', tagid: '' })
      })
      .catch((error) => console.error('Error adding report tag:', error.message))
  }

  const handleDeleteReportTag = (reportid, tagid) => {
    if (window.confirm('Are you sure you want to delete this report-tag relationship?')) {
      fetch(`/api/reporttags/${reportid}/${tagid}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete report-tag relationship')
          }
          fetchReportTags()
        })
        .catch(error => console.error('Error deleting report-tag relationship:', error.message))
    }
  }

  const reportNameMap = reports.reduce((acc, report) => ({ ...acc, [report.reportid]: report.name }), {})
  const tagNameMap = tags.reduce((acc, tag) => ({ ...acc, [tag.tagid]: tag.name }), {})

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Report Tags</h1>
        <CButton color="primary" onClick={() => setVisible(true)}>
          Add Report Tag
        </CButton>
      </div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Report</CTableHeaderCell>
            <CTableHeaderCell>Tag</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {reportTags.map((rt, index) => (
            <CTableRow key={`${rt.reportid}-${rt.tagid}-${index}`}>
              <CTableDataCell>{reportNameMap[rt.reportid] || rt.reportid}</CTableDataCell>
              <CTableDataCell>{tagNameMap[rt.tagid] || rt.tagid}</CTableDataCell>
              <CTableDataCell>
                <CButton color="danger" size="sm" onClick={() => handleDeleteReportTag(rt.reportid, rt.tagid)}>
                  Delete
                </CButton>
              </CTableDataCell>
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
