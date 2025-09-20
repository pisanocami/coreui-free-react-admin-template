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
  const [newInsight, setNewInsight] = useState({
    reportsectionid: '',
    title: '',
    type: '',
    content: '',
    position: '',
    priority: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insightsRes, sectionsRes] = await Promise.all([
          fetch('/api/insights'),
          fetch('/api/reportsections'),
        ])
        const insightsData = await insightsRes.json()
        const sectionsData = await sectionsRes.json()
        setInsights(insightsData)
        setSections(sectionsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewInsight({ ...newInsight, [name]: value })
  }

  const handleAddInsight = () => {
    const insightData = {
      ...newInsight,
      reportsectionid: parseInt(newInsight.reportsectionid, 10),
      position: newInsight.position ? parseInt(newInsight.position, 10) : null,
    }

    fetch('/api/insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(insightData),
    })
      .then((response) => response.json())
      .then((addedInsight) => {
        if (addedInsight.error) {
          alert(`Error: ${addedInsight.error}`)
        } else {
          fetch('/api/insights').then((res) => res.json()).then(setInsights)
          setVisible(false)
          setNewInsight({ reportsectionid: '', title: '', type: '', content: '', position: '', priority: '' })
        }
      })
      .catch((error) => console.error('Error adding insight:', error))
  }

  const sectionNameMap = sections.reduce((acc, section) => ({ ...acc, [section.sectionid]: section.sectionname }), {})

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Insights</h1>
        <CButton color="primary" onClick={() => setVisible(!visible)}>
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
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Add New Insight</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect name="reportsectionid" label="Report Section" value={newInsight.reportsectionid} onChange={handleInputChange} className="mb-3">
              <option>Select Section</option>
              {sections.map((s) => (<option key={s.sectionid} value={s.sectionid}>{s.sectionname}</option>))}
            </CFormSelect>
            <CFormInput type="text" name="title" label="Title" value={newInsight.title} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="type" label="Type" value={newInsight.type} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="content" label="Content" value={newInsight.content} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="number" name="position" label="Position" value={newInsight.position} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="priority" label="Priority" value={newInsight.priority} onChange={handleInputChange} />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleAddInsight}>Save Insight</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default Insights
