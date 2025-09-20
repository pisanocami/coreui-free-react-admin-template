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

const MetricValues = () => {
  const [values, setValues] = useState([])
  const [metrics, setMetrics] = useState([])
  const [entities, setEntities] = useState([])
  const [reports, setReports] = useState([])
  const [visible, setVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentValue, setCurrentValue] = useState({ metricid: '', entityid: '', reportid: '', periodtype: '', periodvalue: '', value: '', additionalinfo: '' })

  const fetchValues = () => {
    fetch('/api/metricvalues')
      .then((response) => response.json())
      .then((data) => setValues(data))
      .catch((error) => console.error('Error fetching metric values:', error))
  }

  const fetchRelatedData = async () => {
    try {
      const [metricsRes, entitiesRes, reportsRes] = await Promise.all([
        fetch('/api/metrics'),
        fetch('/api/entities'),
        fetch('/api/reports'),
      ])
      const metricsData = await metricsRes.json()
      const entitiesData = await entitiesRes.json()
      const reportsData = await reportsRes.json()
      setMetrics(metricsData)
      setEntities(entitiesData)
      setReports(reportsData)
    } catch (error) {
      console.error('Error fetching related data:', error)
    }
  }

  useEffect(() => {
    fetchValues()
    fetchRelatedData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentValue({ ...currentValue, [name]: value })
  }

  const handleSaveValue = () => {
    const method = isEditMode ? 'PUT' : 'POST'
    const url = isEditMode ? `/api/metricvalues/${currentValue.valueid}` : '/api/metricvalues'

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentValue),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error) })
        }
        return response.status === 204 ? null : response.json()
      })
      .then(() => {
        fetchValues()
        setVisible(false)
      })
      .catch((error) => console.error(`Error ${isEditMode ? 'updating' : 'adding'} metric value:`, error.message))
  }

  const openModalForCreate = () => {
    setIsEditMode(false)
    setCurrentValue({ metricid: '', entityid: '', reportid: '', periodtype: '', periodvalue: '', value: '', additionalinfo: '' })
    setVisible(true)
  }

  const openModalForEdit = (value) => {
    setIsEditMode(true)
    setCurrentValue(value)
    setVisible(true)
  }

  const handleDeleteValue = (valueid) => {
    if (window.confirm('Are you sure you want to delete this metric value?')) {
      fetch(`/api/metricvalues/${valueid}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete metric value')
          }
          fetchValues()
        })
        .catch(error => console.error('Error deleting metric value:', error.message))
    }
  }

  const metricNameMap = metrics.reduce((acc, metric) => ({ ...acc, [metric.metricid]: metric.name }), {})
  const entityNameMap = entities.reduce((acc, entity) => ({ ...acc, [entity.entityid]: entity.name }), {})
  const reportNameMap = reports.reduce((acc, report) => ({ ...acc, [report.reportid]: report.name }), {})

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Metric Values</h1>
        <CButton color="primary" onClick={openModalForCreate}>
          Add Metric Value
        </CButton>
      </div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Metric</CTableHeaderCell>
            <CTableHeaderCell>Entity</CTableHeaderCell>
            <CTableHeaderCell>Report</CTableHeaderCell>
            <CTableHeaderCell>Value</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {values.map((val) => (
            <CTableRow key={val.valueid}>
              <CTableDataCell>{val.valueid}</CTableDataCell>
              <CTableDataCell>{metricNameMap[val.metricid] || val.metricid}</CTableDataCell>
              <CTableDataCell>{entityNameMap[val.entityid] || val.entityid}</CTableDataCell>
              <CTableDataCell>{reportNameMap[val.reportid] || 'N/A'}</CTableDataCell>
              <CTableDataCell>{val.value}</CTableDataCell>
              <CTableDataCell>
                <CButton color="light" size="sm" onClick={() => openModalForEdit(val)} className="me-2">
                  Edit
                </CButton>
                <CButton color="danger" size="sm" onClick={() => handleDeleteValue(val.valueid)}>
                  Delete
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>{isEditMode ? 'Edit Metric Value' : 'Add New Metric Value'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect name="metricid" label="Metric" value={currentValue.metricid || ''} onChange={handleInputChange} className="mb-3">
              <option>Select Metric</option>
              {metrics.map((m) => (<option key={m.metricid} value={m.metricid}>{m.name}</option>))}
            </CFormSelect>
            <CFormSelect name="entityid" label="Entity" value={currentValue.entityid || ''} onChange={handleInputChange} className="mb-3">
              <option>Select Entity</option>
              {entities.map((e) => (<option key={e.entityid} value={e.entityid}>{e.name}</option>))}
            </CFormSelect>
            <CFormSelect name="reportid" label="Report (Optional)" value={currentValue.reportid || ''} onChange={handleInputChange} className="mb-3">
              <option value="">Select Report</option>
              {reports.map((r) => (<option key={r.reportid} value={r.reportid}>{r.name}</option>))}
            </CFormSelect>
            <CFormInput type="text" name="value" label="Value" value={currentValue.value || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="periodtype" label="Period Type" value={currentValue.periodtype || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="periodvalue" label="Period Value" value={currentValue.periodvalue || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="additionalinfo" label="Additional Info" value={currentValue.additionalinfo || ''} onChange={handleInputChange} />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleSaveValue}>{isEditMode ? 'Update Value' : 'Save Value'}</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default MetricValues
