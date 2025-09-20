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
  const [newItem, setNewItem] = useState({
    sectionid: '',
    itemtitle: '',
    content: '',
    position: '',
    type: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, sectionsRes] = await Promise.all([
          fetch('/api/sectionitems'),
          fetch('/api/reportsections'),
        ])
        const itemsData = await itemsRes.json()
        const sectionsData = await sectionsRes.json()
        setItems(itemsData)
        setSections(sectionsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewItem({ ...newItem, [name]: value })
  }

  const handleAddItem = () => {
    const itemData = {
      ...newItem,
      sectionid: parseInt(newItem.sectionid, 10),
      position: newItem.position ? parseInt(newItem.position, 10) : null,
    }

    fetch('/api/sectionitems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    })
      .then((response) => response.json())
      .then((addedItem) => {
        if (addedItem.error) {
          alert(`Error: ${addedItem.error}`)
        } else {
          fetch('/api/sectionitems').then((res) => res.json()).then(setItems)
          setVisible(false)
          setNewItem({ sectionid: '', itemtitle: '', content: '', position: '', type: '' })
        }
      })
      .catch((error) => console.error('Error adding section item:', error))
  }

  const sectionNameMap = sections.reduce((acc, section) => ({ ...acc, [section.sectionid]: section.sectionname }), {})

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Section Items</h1>
        <CButton color="primary" onClick={() => setVisible(!visible)}>
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
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Add New Section Item</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect name="sectionid" label="Section" value={newItem.sectionid} onChange={handleInputChange} className="mb-3">
              <option>Select Section</option>
              {sections.map((s) => (<option key={s.sectionid} value={s.sectionid}>{s.sectionname}</option>))}
            </CFormSelect>
            <CFormInput type="text" name="itemtitle" label="Item Title" value={newItem.itemtitle} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="content" label="Content" value={newItem.content} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="number" name="position" label="Position" value={newItem.position} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="text" name="type" label="Type" value={newItem.type} onChange={handleInputChange} />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleAddItem}>Save Item</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default SectionItems
