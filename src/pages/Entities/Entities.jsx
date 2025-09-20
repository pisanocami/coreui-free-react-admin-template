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

const Entities = () => {
  const [entities, setEntities] = useState([])
  const [visible, setVisible] = useState(false)
  const [newEntity, setNewEntity] = useState({ name: '', type: '', domain: '', description: '' })

  useEffect(() => {
    fetch('/api/entities')
      .then((response) => response.json())
      .then((data) => setEntities(data))
      .catch((error) => console.error('Error fetching entities:', error))
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewEntity({ ...newEntity, [name]: value })
  }

  const handleAddEntity = () => {
    fetch('/api/entities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEntity),
    })
      .then((response) => response.json())
      .then((addedEntity) => {
        setEntities([...entities, addedEntity])
        setVisible(false)
        setNewEntity({ name: '', type: '', domain: '', description: '' })
      })
      .catch((error) => console.error('Error adding entity:', error))
  }

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Entities</h1>
        <CButton color="primary" onClick={() => setVisible(!visible)}>
          Add Entity
        </CButton>
      </div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Type</CTableHeaderCell>
            <CTableHeaderCell>Domain</CTableHeaderCell>
            <CTableHeaderCell>Description</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {entities.map((entity) => (
            <CTableRow key={entity.entityid}>
              <CTableDataCell>{entity.entityid}</CTableDataCell>
              <CTableDataCell>{entity.name}</CTableDataCell>
              <CTableDataCell>{entity.type}</CTableDataCell>
              <CTableDataCell>{entity.domain}</CTableDataCell>
              <CTableDataCell>{entity.description}</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>Add New Entity</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              name="name"
              label="Name"
              placeholder="Enter entity name"
              value={newEntity.name}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="type"
              label="Type"
              placeholder="Enter type"
              value={newEntity.type}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="domain"
              label="Domain"
              placeholder="Enter domain"
              value={newEntity.domain}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="description"
              label="Description"
              placeholder="Enter description"
              value={newEntity.description}
              onChange={handleInputChange}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleAddEntity}>
            Save Entity
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default Entities
