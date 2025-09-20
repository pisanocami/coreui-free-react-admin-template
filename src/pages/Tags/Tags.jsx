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
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentTag, setCurrentTag] = useState({ name: '', description: '' })

  const fetchTags = () => {
    fetch('/api/tags')
      .then((response) => response.json())
      .then((data) => setTags(data))
      .catch((error) => console.error('Error fetching tags:', error))
  }

  useEffect(() => {
    fetchTags()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentTag({ ...currentTag, [name]: value })
  }

  const handleSaveTag = () => {
    const method = isEditMode ? 'PUT' : 'POST'
    const url = isEditMode ? `/api/tags/${currentTag.tagid}` : '/api/tags'

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentTag),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error) })
        }
        return response.status === 204 ? null : response.json()
      })
      .then(() => {
        fetchTags()
        setVisible(false)
      })
      .catch((error) => console.error(`Error ${isEditMode ? 'updating' : 'adding'} tag:`, error.message))
  }

  const openModalForCreate = () => {
    setIsEditMode(false)
    setCurrentTag({ name: '', description: '' })
    setVisible(true)
  }

  const openModalForEdit = (tag) => {
    setIsEditMode(true)
    setCurrentTag(tag)
    setVisible(true)
  }

  const handleDeleteTag = (tagid) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      fetch(`/api/tags/${tagid}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete tag')
          }
          fetchTags()
        })
        .catch(error => console.error('Error deleting tag:', error.message))
    }
  }

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Tags</h1>
        <CButton color="primary" onClick={openModalForCreate}>
          Add Tag
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
          {tags.map((tag) => (
            <CTableRow key={tag.tagid}>
              <CTableDataCell>{tag.tagid}</CTableDataCell>
              <CTableDataCell>{tag.name}</CTableDataCell>
              <CTableDataCell>{tag.description}</CTableDataCell>
              <CTableDataCell>
                <CButton color="light" size="sm" onClick={() => openModalForEdit(tag)} className="me-2">
                  Edit
                </CButton>
                <CButton color="danger" size="sm" onClick={() => handleDeleteTag(tag.tagid)}>
                  Delete
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>{isEditMode ? 'Edit Tag' : 'Add New Tag'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              name="name"
              label="Name"
              value={currentTag.name || ''}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="description"
              label="Description"
              value={currentTag.description || ''}
              onChange={handleInputChange}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSaveTag}>
            {isEditMode ? 'Update Tag' : 'Save Tag'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default Tags
