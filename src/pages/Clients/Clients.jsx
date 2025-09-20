import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CPagination,
  CPaginationItem,
} from '@coreui/react';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [visible, setVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentClient, setCurrentClient] = useState({ name: '', industry: '', region: '' });
  
  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Estados para la búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para el ordenamiento
  const [sortConfig, setSortConfig] = useState({ key: 'clientid', direction: 'ascending' });

  const fetchClients = () => {
    fetch('/api/clients')
      .then((response) => response.json())
      .then((data) => setClients(data))
      .catch((error) => console.error('Error fetching clients:', error));
  };
  
  // Función para ordenar los clientes
  const sortedClients = React.useMemo(() => {
    const sortableItems = [...clients];
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
  }, [clients, sortConfig]);
  
  // Función para filtrar los clientes según el término de búsqueda
  const filteredClients = React.useMemo(() => {
    return sortedClients.filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.region.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedClients, searchTerm]);
  
  // Función para obtener los clientes paginados
  const paginatedClients = React.useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredClients.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredClients, currentPage, itemsPerPage]);
  
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

  useEffect(() => {
    fetchClients();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentClient({ ...currentClient, [name]: value });
  };

  const handleSaveClient = () => {
    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode ? `/api/clients/${currentClient.clientid}` : '/api/clients';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentClient),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error) });
        }
        return response.status === 204 ? null : response.json();
      })
      .then(() => {
        fetchClients();
        setVisible(false);
      })
      .catch((error) => console.error(`Error ${isEditMode ? 'updating' : 'adding'} client:`, error.message));
  };

  const openModalForCreate = () => {
    setIsEditMode(false);
    setCurrentClient({ name: '', industry: '', region: '' });
    setVisible(true);
  };

  const openModalForEdit = (client) => {
    setIsEditMode(true);
    setCurrentClient(client);
    setVisible(true);
  };

  const handleDeleteClient = (clientid) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      fetch(`/api/clients/${clientid}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete client');
          }
          fetchClients();
        })
        .catch(error => console.error('Error deleting client:', error.message));
    }
  };

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <strong>Clients</strong>
                <CButton color="primary" onClick={openModalForCreate}>
                  Add Client
                </CButton>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <CFormInput
                  type="text"
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Resetear a la primera página cuando se busca
                  }}
                  className="w-50"
                />
              </div>
            </CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell 
                      onClick={() => requestSort('clientid')}
                      style={{ cursor: 'pointer' }}
                    >
                      ID {sortConfig.key === 'clientid' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => requestSort('name')}
                      style={{ cursor: 'pointer' }}
                    >
                      Name {sortConfig.key === 'name' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => requestSort('industry')}
                      style={{ cursor: 'pointer' }}
                    >
                      Industry {sortConfig.key === 'industry' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => requestSort('region')}
                      style={{ cursor: 'pointer' }}
                    >
                      Region {sortConfig.key === 'region' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {paginatedClients.map((client) => (
                    <CTableRow key={client.clientid}>
                      <CTableDataCell>{client.clientid}</CTableDataCell>
                      <CTableDataCell>{client.name}</CTableDataCell>
                      <CTableDataCell>{client.industry}</CTableDataCell>
                      <CTableDataCell>{client.region}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="light" size="sm" onClick={() => openModalForEdit(client)} className="me-2">
                          Edit
                        </CButton>
                        <CButton color="danger" size="sm" onClick={() => handleDeleteClient(client.clientid)}>
                          Delete
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              
              {/* Paginación */}
              <CPagination align="center" className="mt-3">
                {[...Array(Math.ceil(filteredClients.length / itemsPerPage)).keys()].map(number => (
                  <CPaginationItem 
                    key={number + 1} 
                    active={number + 1 === currentPage}
                    onClick={() => paginate(number + 1)}
                  >
                    {number + 1}
                  </CPaginationItem>
                ))}
              </CPagination>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>{isEditMode ? 'Edit Client' : 'Add New Client'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              name="name"
              label="Name"
              value={currentClient.name || ''}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="industry"
              label="Industry"
              value={currentClient.industry || ''}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="region"
              label="Region"
              value={currentClient.region || ''}
              onChange={handleInputChange}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSaveClient}>
            {isEditMode ? 'Update Client' : 'Save Client'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default Clients;
