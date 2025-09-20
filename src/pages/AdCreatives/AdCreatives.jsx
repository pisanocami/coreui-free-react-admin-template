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

const AdCreatives = () => {
  const [creatives, setCreatives] = useState([])
  const [entities, setEntities] = useState([])
  const [reports, setReports] = useState([])
  const [visible, setVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentCreative, setCurrentCreative] = useState({ entityid: '', reportid: '', format: '', campaign: '', creativeurl: '', performancenotes: '', adplatform: '' })

  const fetchCreatives = () => {
    fetch('/api/adcreatives')
      .then((response) => response.json())
      .then((data) => setCreatives(data))
      .catch((error) => console.error('Error fetching ad creatives:', error))
  }

  const fetchEntities = () => {
    fetch('/api/entities')
      .then((response) => response.json())
      .then((data) => setEntities(data))
      .catch((error) => console.error('Error fetching entities:', error))
  }

  const fetchReports = () => {
    fetch('/api/reports')
      .then((response) => response.json())
      .then((data) => setReports(data))
      .catch((error) => console.error('Error fetching reports:', error))
  }

  useEffect(() => {
    fetchCreatives()
    fetchEntities()
    fetchReports()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentCreative({ ...currentCreative, [name]: value })
  }

  const handleSaveCreative = () => {
    const method = isEditMode ? 'PUT' : 'POST'
    const url = isEditMode ? `/api/adcreatives/${currentCreative.adid}` : '/api/adcreatives'

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentCreative),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error) })
        }
        return response.status === 204 ? null : response.json()
      })
      .then(() => {
        fetchCreatives()
        setVisible(false)
      })
      .catch((error) => console.error(`Error ${isEditMode ? 'updating' : 'adding'} ad creative:`, error.message))
  }

  const openModalForCreate = () => {
    setIsEditMode(false)
    setCurrentCreative({ entityid: '', reportid: '', format: '', campaign: '', creativeurl: '', performancenotes: '', adplatform: '' })
    setVisible(true)
  }

  const openModalForEdit = (creative) => {
    setIsEditMode(true)
    setCurrentCreative(creative)
    setVisible(true)
  }

  const handleDeleteCreative = (adid) => {
    if (window.confirm('Are you sure you want to delete this ad creative?')) {
      fetch(`/api/adcreatives/${adid}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete ad creative')
          }
          fetchCreatives()
        })
        .catch(error => console.error('Error deleting ad creative:', error.message))
    }
  }

  const entityNameMap = entities.reduce((acc, entity) => ({ ...acc, [entity.entityid]: entity.name }), {})
  const reportNameMap = reports.reduce((acc, report) => ({ ...acc, [report.reportid]: report.name }), {})

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Ad Creatives</h1>
        <CButton color="primary" onClick={openModalForCreate}>
          Add Ad Creative
        </CButton>
      </div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Campaign</CTableHeaderCell>
            <CTableHeaderCell>Format</CTableHeaderCell>
            <CTableHeaderCell>Platform</CTableHeaderCell>
            <CTableHeaderCell>Entity</CTableHeaderCell>
            <CTableHeaderCell>Report</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {creatives.map((creative) => (
            <CTableRow key={creative.adid}>
              <CTableDataCell>{creative.adid}</CTableDataCell>
              <CTableDataCell>{creative.campaign}</CTableDataCell>
              <CTableDataCell>{creative.format}</CTableDataCell>
              <CTableDataCell>{creative.adplatform}</CTableDataCell>
              <CTableDataCell>{entityNameMap[creative.entityid] || creative.entityid}</CTableDataCell>
              <CTableDataCell>{reportNameMap[creative.reportid] || creative.reportid}</CTableDataCell>
              <CTableDataCell>
                <CButton color="light" size="sm" onClick={() => openModalForEdit(creative)} className="me-2">
                  Edit
                </CButton>
                <CButton color="danger" size="sm" onClick={() => handleDeleteCreative(creative.adid)}>
                  Delete
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>{isEditMode ? 'Edit Ad Creative' : 'Add New Ad Creative'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect name="entityid" label="Entity" value={currentCreative.entityid || ''} onChange={handleInputChange} className="mb-3">
              <option>Select Entity</option>
              {entities.map((e) => (<option key={e.entityid} value={e.entityid}>{e.name}</option>))}
            </CFormSelect>
            <CFormSelect name="reportid" label="Report" value={currentCreative.reportid || ''} onChange={handleInputChange} className="mb-3">
              <option>Select Report</option>
              {reports.map((r) => (<option key={r.reportid} value={r.reportid}>{r.name}</option>))}
            </CFormSelect>
            <CFormInput type="text" name="campaign" label="Campaign" value={currentCreative.campaign || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="format" label="Format" value={currentCreative.format || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="adplatform" label="Ad Platform" value={currentCreative.adplatform || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="creativeurl" label="Creative URL" value={currentCreative.creativeurl || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="performancenotes" label="Performance Notes" value={currentCreative.performancenotes || ''} onChange={handleInputChange} />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleSaveCreative}>{isEditMode ? 'Update Ad Creative' : 'Save Ad Creative'}</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default AdCreatives
