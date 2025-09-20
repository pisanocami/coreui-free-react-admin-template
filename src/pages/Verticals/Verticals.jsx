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

const Verticals = () => {
  const [verticals, setVerticals] = useState([])
  const [visible, setVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentVertical, setCurrentVertical] = useState({ name: '', description: '' })

  const fetchVerticals = () => {
    fetch('/api/verticals')
      .then((response) => response.json())
      .then((data) => setVerticals(data))
      .catch((error) => console.error('Error fetching verticals:', error))
  }

  useEffect(() => {
    fetchVerticals()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentVertical({ ...currentVertical, [name]: value })
  }

  const handleSaveVertical = () => {
    const method = isEditMode ? 'PUT' : 'POST'
    const url = isEditMode ? `/api/verticals/${currentVertical.verticalid}` : '/api/verticals'

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentVertical),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error) })
        }
        return response.status === 204 ? null : response.json()
      })
      .then(() => {
        fetchVerticals()
        setVisible(false)
      })
      .catch((error) => console.error(`Error ${isEditMode ? 'updating' : 'adding'} vertical:`, error.message))
  }

  const openModalForCreate = () => {
    setIsEditMode(false)
    setCurrentVertical({ name: '', description: '' })
    setVisible(true)
  }

  const openModalForEdit = (vertical) => {
    setIsEditMode(true)
    setCurrentVertical(vertical)
    setVisible(true)
  }

  const handleDeleteVertical = (verticalid) => {
    if (window.confirm('Are you sure you want to delete this vertical?')) {
      fetch(`/api/verticals/${verticalid}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete vertical')
          }
          fetchVerticals()
        })
        .catch(error => console.error('Error deleting vertical:', error.message))
    }
  }

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Verticals</h1>
        <CButton color="primary" onClick={openModalForCreate}>
          Add Vertical
        </CButton>
      </div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Description</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {verticals.map((vertical) => (
            <CTableRow key={vertical.verticalid}>
              <CTableDataCell>{vertical.verticalid}</CTableDataCell>
              <CTableDataCell>{vertical.name}</CTableDataCell>
              <CTableDataCell>{vertical.description}</CTableDataCell>
              <CTableDataCell>
                <CButton color="light" size="sm" onClick={() => openModalForEdit(vertical)} className="me-2">
                  Edit
                </CButton>
                <CButton color="danger" size="sm" onClick={() => handleDeleteVertical(vertical.verticalid)}>
                  Delete
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>{isEditMode ? 'Edit Vertical' : 'Add New Vertical'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              name="name"
              label="Name"
              value={currentVertical.name || ''}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="description"
              label="Description"
              value={currentVertical.description || ''}
              onChange={handleInputChange}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSaveVertical}>
            {isEditMode ? 'Update Vertical' : 'Save Vertical'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default Verticals
