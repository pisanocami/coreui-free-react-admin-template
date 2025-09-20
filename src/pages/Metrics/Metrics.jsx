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
} from '@coreui/react'

const Metrics = () => {
  const [metrics, setMetrics] = useState([])
  const [visible, setVisible] = useState(false)
  const [newMetric, setNewMetric] = useState({ name: '', unit: '', description: '', category: '' })

  useEffect(() => {
    fetch('/api/metrics')
      .then((response) => response.json())
      .then((data) => setMetrics(data))
      .catch((error) => console.error('Error fetching metrics:', error))
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewMetric({ ...newMetric, [name]: value })
  }

  const handleAddMetric = () => {
    fetch('/api/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newMetric),
    })
      .then((response) => response.json())
      .then((addedMetric) => {
        setMetrics([...metrics, addedMetric])
        setVisible(false)
        setNewMetric({ name: '', unit: '', description: '', category: '' })
      })
      .catch((error) => console.error('Error adding metric:', error))
  }

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Metrics</h1>
        <CButton color="primary" onClick={() => setVisible(!visible)}>
          Add Metric
        </CButton>
      </div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Unit</CTableHeaderCell>
            <CTableHeaderCell>Description</CTableHeaderCell>
            <CTableHeaderCell>Category</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {metrics.map((metric) => (
            <CTableRow key={metric.metricid}>
              <CTableDataCell>{metric.metricid}</CTableDataCell>
              <CTableDataCell>{metric.name}</CTableDataCell>
              <CTableDataCell>{metric.unit}</CTableDataCell>
              <CTableDataCell>{metric.description}</CTableDataCell>
              <CTableDataCell>{metric.category}</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>Add New Metric</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              name="name"
              label="Name"
              placeholder="Enter metric name"
              value={newMetric.name}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="unit"
              label="Unit"
              placeholder="Enter unit"
              value={newMetric.unit}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="description"
              label="Description"
              placeholder="Enter description"
              value={newMetric.description}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="category"
              label="Category"
              placeholder="Enter category"
              value={newMetric.category}
              onChange={handleInputChange}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleAddMetric}>
            Save Metric
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default Metrics
