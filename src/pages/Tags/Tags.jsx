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

const Tags = () => {
  const [tags, setTags] = useState([])
  const [visible, setVisible] = useState(false)
  const [newTag, setNewTag] = useState({ name: '', category: '', description: '' })

  useEffect(() => {
    fetch('/api/tags')
      .then((response) => response.json())
      .then((data) => setTags(data))
      .catch((error) => console.error('Error fetching tags:', error))
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewTag({ ...newTag, [name]: value })
  }

  const handleAddTag = () => {
    fetch('/api/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTag),
    })
      .then((response) => response.json())
      .then((addedTag) => {
        setTags([...tags, addedTag])
        setVisible(false)
        setNewTag({ name: '', category: '', description: '' })
      })
      .catch((error) => console.error('Error adding tag:', error))
  }

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Tags</h1>
        <CButton color="primary" onClick={() => setVisible(!visible)}>
          Add Tag
        </CButton>
      </div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Category</CTableHeaderCell>
            <CTableHeaderCell>Description</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {tags.map((tag) => (
            <CTableRow key={tag.tagid}>
              <CTableDataCell>{tag.tagid}</CTableDataCell>
              <CTableDataCell>{tag.name}</CTableDataCell>
              <CTableDataCell>{tag.category}</CTableDataCell>
              <CTableDataCell>{tag.description}</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>Add New Tag</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              name="name"
              label="Name"
              placeholder="Enter tag name"
              value={newTag.name}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="category"
              label="Category"
              placeholder="Enter category"
              value={newTag.category}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="description"
              label="Description"
              placeholder="Enter description"
              value={newTag.description}
              onChange={handleInputChange}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleAddTag}>
            Save Tag
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default Tags
