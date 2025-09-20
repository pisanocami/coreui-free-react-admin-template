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
  const [newCreative, setNewCreative] = useState({
    entityid: '',
    reportid: '',
    format: '',
    campaign: '',
    creativeurl: '',
    performancenotes: '',
    adplatform: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [creativesRes, entitiesRes, reportsRes] = await Promise.all([
          fetch('/api/adcreatives'),
          fetch('/api/entities'),
          fetch('/api/reports'),
        ])
        const creativesData = await creativesRes.json()
        const entitiesData = await entitiesRes.json()
        const reportsData = await reportsRes.json()
        setCreatives(creativesData)
        setEntities(entitiesData)
        setReports(reportsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewCreative({ ...newCreative, [name]: value })
  }

  const handleAddCreative = () => {
    const creativeData = {
      ...newCreative,
      entityid: parseInt(newCreative.entityid, 10),
      reportid: parseInt(newCreative.reportid, 10),
    }

    fetch('/api/adcreatives', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(creativeData),
    })
      .then((response) => response.json())
      .then((addedCreative) => {
        if (addedCreative.error) {
          alert(`Error: ${addedCreative.error}`)
        } else {
          fetch('/api/adcreatives').then((res) => res.json()).then(setCreatives)
          setVisible(false)
          setNewCreative({ entityid: '', reportid: '', format: '', campaign: '', creativeurl: '', performancenotes: '', adplatform: '' })
        }
      })
      .catch((error) => console.error('Error adding ad creative:', error))
  }

  const entityNameMap = entities.reduce((acc, entity) => ({ ...acc, [entity.entityid]: entity.name }), {})
  const reportNameMap = reports.reduce((acc, report) => ({ ...acc, [report.reportid]: report.name }), {})

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Ad Creatives</h1>
        <CButton color="primary" onClick={() => setVisible(!visible)}>
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
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Add New Ad Creative</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect name="entityid" label="Entity" value={newCreative.entityid} onChange={handleInputChange} className="mb-3">
              <option>Select Entity</option>
              {entities.map((e) => (<option key={e.entityid} value={e.entityid}>{e.name}</option>))}
            </CFormSelect>
            <CFormSelect name="reportid" label="Report" value={newCreative.reportid} onChange={handleInputChange} className="mb-3">
              <option>Select Report</option>
              {reports.map((r) => (<option key={r.reportid} value={r.reportid}>{r.name}</option>))}
            </CFormSelect>
            <CFormInput type="text" name="campaign" label="Campaign" value={newCreative.campaign} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="format" label="Format" value={newCreative.format} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="adplatform" label="Ad Platform" value={newCreative.adplatform} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="creativeurl" label="Creative URL" value={newCreative.creativeurl} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="performancenotes" label="Performance Notes" value={newCreative.performancenotes} onChange={handleInputChange} />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleAddCreative}>Save Ad Creative</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default AdCreatives
