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

const Competitors = () => {
  const [competitors, setCompetitors] = useState([])
  const [verticals, setVerticals] = useState([])
  const [visible, setVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentCompetitor, setCurrentCompetitor] = useState({ name: '', verticalid: null, description: '' })

  const fetchCompetitors = () => {
    fetch('/api/competitors')
      .then((response) => response.json())
      .then((data) => setCompetitors(data))
      .catch((error) => console.error('Error fetching competitors:', error))
  }

  const fetchVerticals = () => {
    fetch('/api/verticals')
      .then((response) => response.json())
      .then((data) => setVerticals(data))
      .catch((error) => console.error('Error fetching verticals:', error))
  }

  useEffect(() => {
    fetchCompetitors()
    fetchVerticals()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentCompetitor({ ...currentCompetitor, [name]: value })
  }

  const handleSaveCompetitor = () => {
    const method = isEditMode ? 'PUT' : 'POST'
    const url = isEditMode ? `/api/competitors/${currentCompetitor.competitorid}` : '/api/competitors'

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentCompetitor),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error) })
        }
        return response.status === 204 ? null : response.json()
      })
      .then(() => {
        fetchCompetitors()
        setVisible(false)
      })
      .catch((error) => console.error(`Error ${isEditMode ? 'updating' : 'adding'} competitor:`, error.message))
  }

  const openModalForCreate = () => {
    setIsEditMode(false)
    setCurrentCompetitor({ name: '', verticalid: null, description: '' })
    setVisible(true)
  }

  const openModalForEdit = (competitor) => {
    setIsEditMode(true)
    setCurrentCompetitor(competitor)
    setVisible(true)
  }

  const handleDeleteCompetitor = (competitorid) => {
    if (window.confirm('Are you sure you want to delete this competitor?')) {
      fetch(`/api/competitors/${competitorid}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete competitor')
          }
          fetchCompetitors()
        })
        .catch(error => console.error('Error deleting competitor:', error.message))
    }
  }

  const verticalNameMap = verticals.reduce((acc, v) => ({ ...acc, [v.verticalid]: v.name }), {})

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Competitors</h1>
        <CButton color="primary" onClick={openModalForCreate}>
          Add Competitor
        </CButton>
      </div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Vertical</CTableHeaderCell>
            <CTableHeaderCell>Description</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {competitors.map((competitor) => (
            <CTableRow key={competitor.competitorid}>
              <CTableDataCell>{competitor.competitorid}</CTableDataCell>
              <CTableDataCell>{competitor.name}</CTableDataCell>
              <CTableDataCell>{verticalNameMap[competitor.verticalid] || 'N/A'}</CTableDataCell>
              <CTableDataCell>{competitor.description}</CTableDataCell>
              <CTableDataCell>
                <CButton color="light" size="sm" onClick={() => openModalForEdit(competitor)} className="me-2">
                  Edit
                </CButton>
                <CButton color="danger" size="sm" onClick={() => handleDeleteCompetitor(competitor.competitorid)}>
                  Delete
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>{isEditMode ? 'Edit Competitor' : 'Add New Competitor'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              name="name"
              label="Name"
              value={currentCompetitor.name || ''}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormSelect
              name="verticalid"
              label="Vertical"
              value={currentCompetitor.verticalid || ''}
              onChange={handleInputChange}
              className="mb-3"
            >
              <option value="">Select a Vertical (Optional)</option>
              {verticals.map(v => (
                <option key={v.verticalid} value={v.verticalid}>{v.name}</option>
              ))}
            </CFormSelect>
            <CFormInput
              type="text"
              name="description"
              label="Description"
              value={currentCompetitor.description || ''}
              onChange={handleInputChange}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSaveCompetitor}>
            {isEditMode ? 'Update Competitor' : 'Save Competitor'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default Competitors
