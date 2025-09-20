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
  const [newValue, setNewValue] = useState({
    metricid: '',
    entityid: '',
    reportid: '',
    periodtype: '',
    periodvalue: '',
    value: '',
    additionalinfo: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [valuesRes, metricsRes, entitiesRes, reportsRes] = await Promise.all([
          fetch('/api/metricvalues'),
          fetch('/api/metrics'),
          fetch('/api/entities'),
          fetch('/api/reports'),
        ])
        const valuesData = await valuesRes.json()
        const metricsData = await metricsRes.json()
        const entitiesData = await entitiesRes.json()
        const reportsData = await reportsRes.json()
        setValues(valuesData)
        setMetrics(metricsData)
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
    setNewValue({ ...newValue, [name]: value })
  }

  const handleAddValue = () => {
    const valueData = {
      ...newValue,
      metricid: parseInt(newValue.metricid, 10),
      entityid: parseInt(newValue.entityid, 10),
      reportid: newValue.reportid ? parseInt(newValue.reportid, 10) : null,
    }

    fetch('/api/metricvalues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(valueData),
    })
      .then((response) => response.json())
      .then((addedValue) => {
        if (addedValue.error) {
          alert(`Error: ${addedValue.error}`)
        } else {
          fetch('/api/metricvalues').then((res) => res.json()).then(setValues)
          setVisible(false)
          setNewValue({ metricid: '', entityid: '', reportid: '', periodtype: '', periodvalue: '', value: '', additionalinfo: '' })
        }
      })
      .catch((error) => console.error('Error adding metric value:', error))
  }

  const metricNameMap = metrics.reduce((acc, metric) => ({ ...acc, [metric.metricid]: metric.name }), {})
  const entityNameMap = entities.reduce((acc, entity) => ({ ...acc, [entity.entityid]: entity.name }), {})
  const reportNameMap = reports.reduce((acc, report) => ({ ...acc, [report.reportid]: report.name }), {})

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Metric Values</h1>
        <CButton color="primary" onClick={() => setVisible(!visible)}>
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
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {values.map((val) => (
            <CTableRow key={val.valueid}>
              <CTableDataCell>{val.valueid}</CTableDataCell>
              <CTableDataCell>{metricNameMap[val.metricid] || val.metricid}</CTableDataCell>
              <CTableDataCell>{entityNameMap[val.entityid] || val.entityid}</CTableDataCell>
              <CTableDataCell>{reportNameMap[val.reportid] || val.reportid}</CTableDataCell>
              <CTableDataCell>{val.value}</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Add New Metric Value</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect name="metricid" label="Metric" value={newValue.metricid} onChange={handleInputChange} className="mb-3">
              <option>Select Metric</option>
              {metrics.map((m) => (<option key={m.metricid} value={m.metricid}>{m.name}</option>))}
            </CFormSelect>
            <CFormSelect name="entityid" label="Entity" value={newValue.entityid} onChange={handleInputChange} className="mb-3">
              <option>Select Entity</option>
              {entities.map((e) => (<option key={e.entityid} value={e.entityid}>{e.name}</option>))}
            </CFormSelect>
            <CFormSelect name="reportid" label="Report (Optional)" value={newValue.reportid} onChange={handleInputChange} className="mb-3">
              <option>Select Report</option>
              {reports.map((r) => (<option key={r.reportid} value={r.reportid}>{r.name}</option>))}
            </CFormSelect>
            <CFormInput type="text" name="value" label="Value" value={newValue.value} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="periodtype" label="Period Type" value={newValue.periodtype} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="periodvalue" label="Period Value" value={newValue.periodvalue} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="additionalinfo" label="Additional Info" value={newValue.additionalinfo} onChange={handleInputChange} />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleAddValue}>Save Value</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default MetricValues
