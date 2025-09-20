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
  const [newVertical, setNewVertical] = useState({ name: '', description: '' })

  useEffect(() => {
    fetch('/api/verticals')
      .then((response) => response.json())
      .then((data) => setVerticals(data))
      .catch((error) => console.error('Error fetching verticals:', error))
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewVertical({ ...newVertical, [name]: value })
  }

  const handleAddVertical = () => {
    fetch('/api/verticals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newVertical),
    })
      .then((response) => response.json())
      .then((addedVertical) => {
        setVerticals([...verticals, addedVertical])
        setVisible(false)
        setNewVertical({ name: '', description: '' })
      })
      .catch((error) => console.error('Error adding vertical:', error))
  }

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Verticals</h1>
        <CButton color="primary" onClick={() => setVisible(!visible)}>
          Add Vertical
        </CButton>
      </div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Description</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {verticals.map((vertical) => (
            <CTableRow key={vertical.verticalid}>
              <CTableDataCell>{vertical.verticalid}</CTableDataCell>
              <CTableDataCell>{vertical.name}</CTableDataCell>
              <CTableDataCell>{vertical.description}</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>Add New Vertical</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              name="name"
              label="Name"
              placeholder="Enter vertical name"
              value={newVertical.name}
              onChange={handleInputChange}
            />
            <CFormInput
              type="text"
              name="description"
              label="Description"
              placeholder="Enter description"
              value={newVertical.description}
              onChange={handleInputChange}
              className="mt-3"
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleAddVertical}>
            Save Vertical
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default Verticals
