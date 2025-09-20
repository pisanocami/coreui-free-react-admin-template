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
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentMetric, setCurrentMetric] = useState({ name: '', description: '', type: '' })

  const fetchMetrics = () => {
    fetch('/api/metrics')
      .then((response) => response.json())
      .then((data) => setMetrics(data))
      .catch((error) => console.error('Error fetching metrics:', error))
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentMetric({ ...currentMetric, [name]: value })
  }

  const handleSaveMetric = () => {
    const method = isEditMode ? 'PUT' : 'POST'
    const url = isEditMode ? `/api/metrics/${currentMetric.metricid}` : '/api/metrics'

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentMetric),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error) })
        }
        return response.status === 204 ? null : response.json()
      })
      .then(() => {
        fetchMetrics()
        setVisible(false)
      })
      .catch((error) => console.error(`Error ${isEditMode ? 'updating' : 'adding'} metric:`, error.message))
  }

  const openModalForCreate = () => {
    setIsEditMode(false)
    setCurrentMetric({ name: '', description: '', type: '' })
    setVisible(true)
  }

  const openModalForEdit = (metric) => {
    setIsEditMode(true)
    setCurrentMetric(metric)
    setVisible(true)
  }

  const handleDeleteMetric = (metricid) => {
    if (window.confirm('Are you sure you want to delete this metric?')) {
      fetch(`/api/metrics/${metricid}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete metric')
          }
          fetchMetrics()
        })
        .catch(error => console.error('Error deleting metric:', error.message))
    }
  }

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Metrics</h1>
        <CButton color="primary" onClick={openModalForCreate}>
          Add Metric
        </CButton>
      </div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Type</CTableHeaderCell>
            <CTableHeaderCell>Description</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {metrics.map((metric) => (
            <CTableRow key={metric.metricid}>
              <CTableDataCell>{metric.metricid}</CTableDataCell>
              <CTableDataCell>{metric.name}</CTableDataCell>
              <CTableDataCell>{metric.type}</CTableDataCell>
              <CTableDataCell>{metric.description}</CTableDataCell>
              <CTableDataCell>
                <CButton color="light" size="sm" onClick={() => openModalForEdit(metric)} className="me-2">
                  Edit
                </CButton>
                <CButton color="danger" size="sm" onClick={() => handleDeleteMetric(metric.metricid)}>
                  Delete
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>{isEditMode ? 'Edit Metric' : 'Add New Metric'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              name="name"
              label="Name"
              value={currentMetric.name || ''}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="type"
              label="Type"
              value={currentMetric.type || ''}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="description"
              label="Description"
              value={currentMetric.description || ''}
              onChange={handleInputChange}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSaveMetric}>
            {isEditMode ? 'Update Metric' : 'Save Metric'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default Metrics
