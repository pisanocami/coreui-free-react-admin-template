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

const Competitors = () => {
  const [competitors, setCompetitors] = useState([])
  const [visible, setVisible] = useState(false)
  const [newCompetitor, setNewCompetitor] = useState({ name: '', domain: '', industry: '', description: '' })

  useEffect(() => {
    fetch('/api/competitors')
      .then((response) => response.json())
      .then((data) => setCompetitors(data))
      .catch((error) => console.error('Error fetching competitors:', error))
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewCompetitor({ ...newCompetitor, [name]: value })
  }

  const handleAddCompetitor = () => {
    fetch('/api/competitors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCompetitor),
    })
      .then((response) => response.json())
      .then((addedCompetitor) => {
        setCompetitors([...competitors, addedCompetitor])
        setVisible(false)
        setNewCompetitor({ name: '', domain: '', industry: '', description: '' })
      })
      .catch((error) => console.error('Error adding competitor:', error))
  }

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Competitors</h1>
        <CButton color="primary" onClick={() => setVisible(!visible)}>
          Add Competitor
        </CButton>
      </div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Domain</CTableHeaderCell>
            <CTableHeaderCell>Industry</CTableHeaderCell>
            <CTableHeaderCell>Description</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {competitors.map((competitor) => (
            <CTableRow key={competitor.competitorid}>
              <CTableDataCell>{competitor.competitorid}</CTableDataCell>
              <CTableDataCell>{competitor.name}</CTableDataCell>
              <CTableDataCell>{competitor.domain}</CTableDataCell>
              <CTableDataCell>{competitor.industry}</CTableDataCell>
              <CTableDataCell>{competitor.description}</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>Add New Competitor</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              name="name"
              label="Name"
              placeholder="Enter competitor name"
              value={newCompetitor.name}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="domain"
              label="Domain"
              placeholder="Enter domain"
              value={newCompetitor.domain}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="industry"
              label="Industry"
              placeholder="Enter industry"
              value={newCompetitor.industry}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="description"
              label="Description"
              placeholder="Enter description"
              value={newCompetitor.description}
              onChange={handleInputChange}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleAddCompetitor}>
            Save Competitor
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default Competitors
