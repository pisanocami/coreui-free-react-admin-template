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
  const [reports, setReports] = useState([])
  const [visible, setVisible] = useState(false)
  const [newReview, setNewReview] = useState({
    entityid: '',
    reportid: '',
    ispositive: false,
    reviewsource: '',
    content: '',
    mentionedproduct: '',
    rating: '',
    reviewdate: '',
  })

  useEffect(() => {
    // Fetch all data needed for the page
    const fetchData = async () => {
      try {
        const [reviewsRes, entitiesRes, reportsRes] = await Promise.all([
          fetch('/api/reviews'),
          fetch('/api/entities'),
          fetch('/api/reports'),
        ])
        const reviewsData = await reviewsRes.json()
        const entitiesData = await entitiesRes.json()
        const reportsData = await reportsRes.json()
        setReviews(reviewsData)
        setEntities(entitiesData)
        setReports(reportsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewReview({ ...newReview, [name]: type === 'checkbox' ? checked : value })
  }

  const handleAddReview = () => {
    const reviewData = {
      ...newReview,
      entityid: parseInt(newReview.entityid, 10),
      reportid: parseInt(newReview.reportid, 10),
      rating: newReview.rating ? parseInt(newReview.rating, 10) : null,
    }

    fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    })
      .then((response) => response.json())
      .then((addedReview) => {
        if (addedReview.error) {
          alert(`Error: ${addedReview.error}`)
        } else {
          // Refetch to get the latest data
          fetch('/api/reviews')
            .then((res) => res.json())
            .then(setReviews)
          setVisible(false)
          setNewReview({ entityid: '', reportid: '', ispositive: false, reviewsource: '', content: '', mentionedproduct: '', rating: '', reviewdate: '' })
        }
      })
      .catch((error) => console.error('Error adding review:', error))
  }

  const entityNameMap = entities.reduce((acc, entity) => ({ ...acc, [entity.entityid]: entity.name }), {})
  const reportNameMap = reports.reduce((acc, report) => ({ ...acc, [report.reportid]: report.name }), {})

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Reviews</h1>
        <CButton color="primary" onClick={() => setVisible(!visible)}>
          Add Review
        </CButton>
      </div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Content</CTableHeaderCell>
            <CTableHeaderCell>Entity</CTableHeaderCell>
            <CTableHeaderCell>Report</CTableHeaderCell>
            <CTableHeaderCell>Rating</CTableHeaderCell>
            <CTableHeaderCell>Positive</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {reviews.map((review) => (
            <CTableRow key={review.reviewid}>
              <CTableDataCell>{review.reviewid}</CTableDataCell>
              <CTableDataCell>{review.content}</CTableDataCell>
              <CTableDataCell>{entityNameMap[review.entityid] || review.entityid}</CTableDataCell>
              <CTableDataCell>{reportNameMap[review.reportid] || review.reportid}</CTableDataCell>
              <CTableDataCell>{review.rating}</CTableDataCell>
              <CTableDataCell>{review.ispositive ? 'Yes' : 'No'}</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Add New Review</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect name="entityid" label="Entity" value={newReview.entityid} onChange={handleInputChange} className="mb-3">
              <option>Select Entity</option>
              {entities.map((e) => (<option key={e.entityid} value={e.entityid}>{e.name}</option>))}
            </CFormSelect>
            <CFormSelect name="reportid" label="Report" value={newReview.reportid} onChange={handleInputChange} className="mb-3">
              <option>Select Report</option>
              {reports.map((r) => (<option key={r.reportid} value={r.reportid}>{r.name}</option>))}
            </CFormSelect>
            <CFormInput type="text" name="content" label="Content" value={newReview.content} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="reviewsource" label="Source" value={newReview.reviewsource} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="mentionedproduct" label="Mentioned Product" value={newReview.mentionedproduct} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="number" name="rating" label="Rating (1-5)" value={newReview.rating} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="date" name="reviewdate" label="Review Date" value={newReview.reviewdate} onChange={handleInputChange} className="mb-3" />
            <CFormCheck name="ispositive" label="Is Positive?" checked={newReview.ispositive} onChange={handleInputChange} />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleAddReview}>Save Review</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default Reviews
