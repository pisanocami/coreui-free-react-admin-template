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
  CPagination,
  CPaginationItem,
} from '@coreui/react'

const Entities = () => {
  const [entities, setEntities] = useState([])
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [visible, setVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentEntity, setCurrentEntity] = useState({ name: '', type: '', clientid: null })
  
  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Estados para el ordenamiento
  const [sortConfig, setSortConfig] = useState({ key: 'entityid', direction: 'ascending' });

  const fetchEntities = () => {
    fetch('/api/entities')
      .then((response) => response.json())
      .then((data) => setEntities(data))
      .catch((error) => console.error('Error fetching entities:', error))
  }

  const fetchClients = () => {
    fetch('/api/clients')
      .then((response) => response.json())
      .then((data) => setClients(data))
      .catch((error) => console.error('Error fetching clients:', error))
  }

  useEffect(() => {
    fetchEntities()
    fetchClients()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentEntity({ ...currentEntity, [name]: value })
  }

  const handleSaveEntity = () => {
    const method = isEditMode ? 'PUT' : 'POST'
    const url = isEditMode ? `/api/entities/${currentEntity.entityid}` : '/api/entities'

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentEntity),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error) })
        }
        return response.status === 204 ? null : response.json()
      })
      .then(() => {
        fetchEntities() // Re-fetch entities to show the new/updated one
        setVisible(false)
      })
      .catch((error) => console.error(`Error ${isEditMode ? 'updating' : 'adding'} entity:`, error.message))
  }

  const openModalForCreate = () => {
    setIsEditMode(false)
    setCurrentEntity({ name: '', type: '', clientid: null })
    setVisible(true)
  }

  const openModalForEdit = (entity) => {
    setIsEditMode(true)
    setCurrentEntity(entity)
    setVisible(true)
  }

  const handleDeleteEntity = (entityid) => {
    if (window.confirm('Are you sure you want to delete this entity?')) {
      fetch(`/api/entities/${entityid}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete entity')
          }
          fetchEntities() // Re-fetch to update the list
        })
        .catch(error => console.error('Error deleting entity:', error.message))
    }
  }
  
  const clientNameMap = clients.reduce((acc, client) => ({ ...acc, [client.clientid]: client.name }), {})

  // Función para ordenar las entidades
  const sortedEntities = React.useMemo(() => {
    const sortableItems = [...entities];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [entities, sortConfig]);
  
  // Función para filtrar las entidades según el término de búsqueda
  const filteredEntities = React.useMemo(() => {
    return sortedEntities.filter(entity => 
      entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedEntities, searchTerm]);
  
  // Función para obtener las entidades paginadas
  const paginatedEntities = React.useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredEntities.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredEntities, currentPage, itemsPerPage]);
  
  // Función para cambiar la página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Función para ordenar por columna
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <CContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Entities</h1>
        <CButton color="primary" onClick={openModalForCreate}>
          Add Entity
        </CButton>
      </div>
      <CFormInput
        type="text"
        placeholder="Search by name or type..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-3"
      />
      <CTable hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell 
              onClick={() => requestSort('entityid')}
              style={{ cursor: 'pointer' }}
            >
              ID {sortConfig.key === 'entityid' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
            </CTableHeaderCell>
            <CTableHeaderCell 
              onClick={() => requestSort('name')}
              style={{ cursor: 'pointer' }}
            >
              Name {sortConfig.key === 'name' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
            </CTableHeaderCell>
            <CTableHeaderCell 
              onClick={() => requestSort('type')}
              style={{ cursor: 'pointer' }}
            >
              Type {sortConfig.key === 'type' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
            </CTableHeaderCell>
            <CTableHeaderCell>Client</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {paginatedEntities.map((entity) => (
            <CTableRow key={entity.entityid}>
              <CTableDataCell>{entity.entityid}</CTableDataCell>
              <CTableDataCell>{entity.name}</CTableDataCell>
              <CTableDataCell>{entity.type}</CTableDataCell>
              <CTableDataCell>{clientNameMap[entity.clientid] || 'N/A'}</CTableDataCell>
              <CTableDataCell>
                <CButton color="light" size="sm" onClick={() => openModalForEdit(entity)} className="me-2">
                  Edit
                </CButton>
                <CButton color="danger" size="sm" onClick={() => handleDeleteEntity(entity.entityid)}>
                  Delete
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
      
      {/* Paginación */}
      <CPagination align="center" className="mt-3">
        {[...Array(Math.ceil(filteredEntities.length / itemsPerPage)).keys()].map(number => (
          <CPaginationItem 
            key={number + 1} 
            active={number + 1 === currentPage}
            onClick={() => paginate(number + 1)}
          >
            {number + 1}
          </CPaginationItem>
        ))}
      </CPagination>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>{isEditMode ? 'Edit Entity' : 'Add New Entity'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              name="name"
              label="Name"
              value={currentEntity.name}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="type"
              label="Type"
              value={currentEntity.type}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormSelect
              name="clientid"
              label="Client"
              value={currentEntity.clientid || ''}
              onChange={handleInputChange}
              className="mb-3"
            >
              <option value="">Select a Client (Optional)</option>
              {clients.map(client => (
                <option key={client.clientid} value={client.clientid}>{client.name}</option>
              ))}
            </CFormSelect>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSaveEntity}>
            {isEditMode ? 'Update Entity' : 'Save Entity'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default Entities
