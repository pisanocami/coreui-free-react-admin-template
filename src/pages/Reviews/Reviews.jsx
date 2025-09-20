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
  CFormCheck,
} from '@coreui/react'

const Reviews = () => {
  const [reviews, setReviews] = useState([])
  const [entities, setEntities] = useState([])
  const [visible, setVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentReview, setCurrentReview] = useState({ entityid: '', source: '', rating: '', content: '' })

  const fetchReviews = () => {
    fetch('/api/reviews')
      .then((response) => response.json())
      .then((data) => setReviews(data))
      .catch((error) => console.error('Error fetching reviews:', error))
  }

  const fetchEntities = () => {
    fetch('/api/entities')
      .then((response) => response.json())
      .then((data) => setEntities(data))
      .catch((error) => console.error('Error fetching entities:', error))
  }

  useEffect(() => {
    fetchReviews()
    fetchEntities()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentReview({ ...currentReview, [name]: value })
  }

  const handleSaveReview = () => {
    const method = isEditMode ? 'PUT' : 'POST'
    const url = isEditMode ? `/api/reviews/${currentReview.reviewid}` : '/api/reviews'

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentReview),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error) })
        }
        return response.status === 204 ? null : response.json()
      })
      .then(() => {
        fetchReviews()
        setVisible(false)
      })
      .catch((error) => console.error(`Error ${isEditMode ? 'updating' : 'adding'} review:`, error.message))
  }

  const openModalForCreate = () => {
    setIsEditMode(false)
    setCurrentReview({ entityid: '', source: '', rating: '', content: '' })
    setVisible(true)
  }

  const openModalForEdit = (review) => {
    setIsEditMode(true)
    setCurrentReview(review)
    setVisible(true)
  }

  const handleDeleteReview = (reviewid) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      fetch(`/api/reviews/${reviewid}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete review')
          }
          fetchReviews()
        })
        .catch(error => console.error('Error deleting review:', error.message))
    }
  }

  const entityNameMap = entities.reduce((acc, entity) => ({ ...acc, [entity.entityid]: entity.name }), {})

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Reviews</h1>
        <CButton color="primary" onClick={openModalForCreate}>
          Add Review
        </CButton>
      </div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Content</CTableHeaderCell>
            <CTableHeaderCell>Entity</CTableHeaderCell>
            <CTableHeaderCell>Rating</CTableHeaderCell>
            <CTableHeaderCell>Source</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {reviews.map((review) => (
            <CTableRow key={review.reviewid}>
              <CTableDataCell>{review.reviewid}</CTableDataCell>
              <CTableDataCell>{review.content}</CTableDataCell>
              <CTableDataCell>{entityNameMap[review.entityid] || review.entityid}</CTableDataCell>
              <CTableDataCell>{review.rating}</CTableDataCell>
              <CTableDataCell>{review.source}</CTableDataCell>
              <CTableDataCell>
                <CButton color="light" size="sm" onClick={() => openModalForEdit(review)} className="me-2">
                  Edit
                </CButton>
                <CButton color="danger" size="sm" onClick={() => handleDeleteReview(review.reviewid)}>
                  Delete
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>{isEditMode ? 'Edit Review' : 'Add New Review'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect name="entityid" label="Entity" value={currentReview.entityid || ''} onChange={handleInputChange} className="mb-3">
              <option>Select Entity</option>
              {entities.map((e) => (<option key={e.entityid} value={e.entityid}>{e.name}</option>))}
            </CFormSelect>
            <CFormInput type="text" name="source" label="Source" value={currentReview.source || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="number" name="rating" label="Rating (1-5)" value={currentReview.rating || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="content" label="Content" value={currentReview.content || ''} onChange={handleInputChange} className="mb-3" />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleSaveReview}>{isEditMode ? 'Update Review' : 'Save Review'}</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default Reviews
