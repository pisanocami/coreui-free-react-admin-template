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

const SectionItems = () => {
  const [items, setItems] = useState([])
  const [sections, setSections] = useState([])
  const [visible, setVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentItem, setCurrentItem] = useState({ sectionid: '', itemtitle: '', content: '', position: '', type: '' })

  const fetchItems = () => {
    fetch('/api/sectionitems')
      .then((response) => response.json())
      .then((data) => setItems(data))
      .catch((error) => console.error('Error fetching section items:', error))
  }

  const fetchSections = () => {
    fetch('/api/reportsections')
      .then((response) => response.json())
      .then((data) => setSections(data))
      .catch((error) => console.error('Error fetching report sections:', error))
  }

  useEffect(() => {
    fetchItems()
    fetchSections()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentItem({ ...currentItem, [name]: value })
  }

  const handleSaveItem = () => {
    const method = isEditMode ? 'PUT' : 'POST'
    const url = isEditMode ? `/api/sectionitems/${currentItem.itemid}` : '/api/sectionitems'

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentItem),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error) })
        }
        return response.status === 204 ? null : response.json()
      })
      .then(() => {
        fetchItems()
        setVisible(false)
      })
      .catch((error) => console.error(`Error ${isEditMode ? 'updating' : 'adding'} section item:`, error.message))
  }

  const openModalForCreate = () => {
    setIsEditMode(false)
    setCurrentItem({ sectionid: '', itemtitle: '', content: '', position: '', type: '' })
    setVisible(true)
  }

  const openModalForEdit = (item) => {
    setIsEditMode(true)
    setCurrentItem(item)
    setVisible(true)
  }

  const handleDeleteItem = (itemid) => {
    if (window.confirm('Are you sure you want to delete this section item?')) {
      fetch(`/api/sectionitems/${itemid}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete section item')
          }
          fetchItems()
        })
        .catch(error => console.error('Error deleting section item:', error.message))
    }
  }

  const sectionNameMap = sections.reduce((acc, section) => ({ ...acc, [section.sectionid]: section.sectionname }), {})

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Section Items</h1>
        <CButton color="primary" onClick={openModalForCreate}>
          Add Section Item
        </CButton>
      </div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Title</CTableHeaderCell>
            <CTableHeaderCell>Section</CTableHeaderCell>
            <CTableHeaderCell>Type</CTableHeaderCell>
            <CTableHeaderCell>Position</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {items.map((item) => (
            <CTableRow key={item.itemid}>
              <CTableDataCell>{item.itemid}</CTableDataCell>
              <CTableDataCell>{item.itemtitle}</CTableDataCell>
              <CTableDataCell>{sectionNameMap[item.sectionid] || item.sectionid}</CTableDataCell>
              <CTableDataCell>{item.type}</CTableDataCell>
              <CTableDataCell>{item.position}</CTableDataCell>
              <CTableDataCell>
                <CButton color="light" size="sm" onClick={() => openModalForEdit(item)} className="me-2">
                  Edit
                </CButton>
                <CButton color="danger" size="sm" onClick={() => handleDeleteItem(item.itemid)}>
                  Delete
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>{isEditMode ? 'Edit Section Item' : 'Add New Section Item'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect name="sectionid" label="Section" value={currentItem.sectionid || ''} onChange={handleInputChange} className="mb-3">
              <option>Select Section</option>
              {sections.map((s) => (<option key={s.sectionid} value={s.sectionid}>{s.sectionname}</option>))}
            </CFormSelect>
            <CFormInput type="text" name="itemtitle" label="Item Title" value={currentItem.itemtitle || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="content" label="Content" value={currentItem.content || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="number" name="position" label="Position" value={currentItem.position || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="type" label="Type" value={currentItem.type || ''} onChange={handleInputChange} />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleSaveItem}>{isEditMode ? 'Update Item' : 'Save Item'}</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default SectionItems
