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

const Insights = () => {
  const [insights, setInsights] = useState([])
  const [sections, setSections] = useState([])
  const [visible, setVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentInsight, setCurrentInsight] = useState({ reportsectionid: '', title: '', type: '', content: '', position: '', priority: '' })

  const fetchInsights = () => {
    fetch('/api/insights')
      .then((response) => response.json())
      .then((data) => setInsights(data))
      .catch((error) => console.error('Error fetching insights:', error))
  }

  const fetchSections = () => {
    fetch('/api/reportsections')
      .then((response) => response.json())
      .then((data) => setSections(data))
      .catch((error) => console.error('Error fetching report sections:', error))
  }

  useEffect(() => {
    fetchInsights()
    fetchSections()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentInsight({ ...currentInsight, [name]: value })
  }

  const handleSaveInsight = () => {
    const method = isEditMode ? 'PUT' : 'POST'
    const url = isEditMode ? `/api/insights/${currentInsight.insightid}` : '/api/insights'

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentInsight),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error) })
        }
        return response.status === 204 ? null : response.json()
      })
      .then(() => {
        fetchInsights()
        setVisible(false)
      })
      .catch((error) => console.error(`Error ${isEditMode ? 'updating' : 'adding'} insight:`, error.message))
  }

  const openModalForCreate = () => {
    setIsEditMode(false)
    setCurrentInsight({ reportsectionid: '', title: '', type: '', content: '', position: '', priority: '' })
    setVisible(true)
  }

  const openModalForEdit = (insight) => {
    setIsEditMode(true)
    setCurrentInsight(insight)
    setVisible(true)
  }

  const handleDeleteInsight = (insightid) => {
    if (window.confirm('Are you sure you want to delete this insight?')) {
      fetch(`/api/insights/${insightid}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete insight')
          }
          fetchInsights()
        })
        .catch(error => console.error('Error deleting insight:', error.message))
    }
  }

  const sectionNameMap = sections.reduce((acc, section) => ({ ...acc, [section.sectionid]: section.sectionname }), {})

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Insights</h1>
        <CButton color="primary" onClick={openModalForCreate}>
          Add Insight
        </CButton>
      </div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Title</CTableHeaderCell>
            <CTableHeaderCell>Type</CTableHeaderCell>
            <CTableHeaderCell>Section</CTableHeaderCell>
            <CTableHeaderCell>Priority</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {insights.map((insight) => (
            <CTableRow key={insight.insightid}>
              <CTableDataCell>{insight.insightid}</CTableDataCell>
              <CTableDataCell>{insight.title}</CTableDataCell>
              <CTableDataCell>{insight.type}</CTableDataCell>
              <CTableDataCell>{sectionNameMap[insight.reportsectionid] || insight.reportsectionid}</CTableDataCell>
              <CTableDataCell>{insight.priority}</CTableDataCell>
              <CTableDataCell>
                <CButton color="light" size="sm" onClick={() => openModalForEdit(insight)} className="me-2">
                  Edit
                </CButton>
                <CButton color="danger" size="sm" onClick={() => handleDeleteInsight(insight.insightid)}>
                  Delete
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>{isEditMode ? 'Edit Insight' : 'Add New Insight'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect name="reportsectionid" label="Report Section" value={currentInsight.reportsectionid || ''} onChange={handleInputChange} className="mb-3">
              <option>Select Section</option>
              {sections.map((s) => (<option key={s.sectionid} value={s.sectionid}>{s.sectionname}</option>))}
            </CFormSelect>
            <CFormInput type="text" name="title" label="Title" value={currentInsight.title || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="type" label="Type" value={currentInsight.type || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="content" label="Content" value={currentInsight.content || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="number" name="position" label="Position" value={currentInsight.position || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="priority" label="Priority" value={currentInsight.priority || ''} onChange={handleInputChange} />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleSaveInsight}>{isEditMode ? 'Update Insight' : 'Save Insight'}</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default Insights
