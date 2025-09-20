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
  CFormSelect,
  CFormTextarea,
  CPagination,
  CPaginationItem,
} from '@coreui/react';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visible, setVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentReport, setCurrentReport] = useState({ name: '', clientid: '', startdate: '', enddate: '', status: 'draft' });
  
  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Estados para el ordenamiento
  const [sortConfig, setSortConfig] = useState({ key: 'reportid', direction: 'ascending' });

  const fetchReports = () => {
    fetch('/api/reports')
      .then((response) => response.json())
      .then((data) => setReports(data))
      .catch((error) => console.error('Error fetching reports:', error));
  };

  const fetchClients = () => {
    fetch('/api/clients')
      .then((response) => response.json())
      .then((data) => setClients(data))
      .catch((error) => console.error('Error fetching clients:', error));
  };

  useEffect(() => {
    fetchReports();
    fetchClients();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentReport({ ...currentReport, [name]: value });
  };

  const handleSaveReport = () => {
    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode ? `/api/reports/${currentReport.reportid}` : '/api/reports';

    // Format dates to ISO string if they exist
    const reportData = {
        ...currentReport,
        startdate: currentReport.startdate ? new Date(currentReport.startdate).toISOString() : null,
        enddate: currentReport.enddate ? new Date(currentReport.enddate).toISOString() : null,
    };

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error) });
        }
        return response.status === 204 ? null : response.json();
      })
      .then(() => {
        fetchReports();
        setVisible(false);
      })
      .catch((error) => console.error(`Error ${isEditMode ? 'updating' : 'adding'} report:`, error.message));
  };

  const openModalForCreate = () => {
    setIsEditMode(false);
    setCurrentReport({ name: '', clientid: '', startdate: '', enddate: '', status: 'draft' });
    setVisible(true);
  };

  const openModalForEdit = (report) => {
    setIsEditMode(true);
    // Format dates for input[type=date]
    const formattedReport = {
        ...report,
        startdate: report.startdate ? new Date(report.startdate).toISOString().split('T')[0] : '',
        enddate: report.enddate ? new Date(report.enddate).toISOString().split('T')[0] : '',
    };
    setCurrentReport(formattedReport);
    setVisible(true);
  };

  const handleDeleteReport = (reportid) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      fetch(`/api/reports/${reportid}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete report');
          }
          fetchReports();
        })
        .catch(error => console.error('Error deleting report:', error.message));
    }
  };

  const clientNameMap = clients.reduce((acc, client) => ({ ...acc, [client.clientid]: client.name }), {});
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
  
  // Función para ordenar los reportes
  const sortedReports = React.useMemo(() => {
    const sortableItems = [...reports];
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
  }, [reports, sortConfig]);
  
  // Función para filtrar los reportes según el término de búsqueda
  const filteredReports = React.useMemo(() => {
    return sortedReports.filter(report => 
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientNameMap[report.clientid]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedReports, searchTerm, clientNameMap]);
  
  // Función para obtener los reportes paginados
  const paginatedReports = React.useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredReports.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredReports, currentPage, itemsPerPage]);
  
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
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <strong>Reports</strong>
                <CButton color="primary" onClick={openModalForCreate}>
                  Add Report
                </CButton>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <CFormInput
                  type="text"
                  placeholder="Buscar reportes..."
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
                      onClick={() => requestSort('reportid')}
                      style={{ cursor: 'pointer' }}
                    >
                      ID {sortConfig.key === 'reportid' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => requestSort('name')}
                      style={{ cursor: 'pointer' }}
                    >
                      Name {sortConfig.key === 'name' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </CTableHeaderCell>
                    <CTableHeaderCell>Client</CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => requestSort('status')}
                      style={{ cursor: 'pointer' }}
                    >
                      Status {sortConfig.key === 'status' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => requestSort('startdate')}
                      style={{ cursor: 'pointer' }}
                    >
                      Start Date {sortConfig.key === 'startdate' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </CTableHeaderCell>
                    <CTableHeaderCell 
                      onClick={() => requestSort('enddate')}
                      style={{ cursor: 'pointer' }}
                    >
                      End Date {sortConfig.key === 'enddate' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {paginatedReports.map((report) => (
                    <CTableRow key={report.reportid}>
                      <CTableDataCell>{report.reportid}</CTableDataCell>
                      <CTableDataCell>{report.name}</CTableDataCell>
                      <CTableDataCell>{clientNameMap[report.clientid] || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{report.status}</CTableDataCell>
                      <CTableDataCell>{formatDate(report.startdate)}</CTableDataCell>
                      <CTableDataCell>{formatDate(report.enddate)}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="light" size="sm" onClick={() => openModalForEdit(report)} className="me-2">
                          Edit
                        </CButton>
                        <CButton color="danger" size="sm" onClick={() => handleDeleteReport(report.reportid)}>
                          Delete
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              
              {/* Paginación */}
              <CPagination align="center" className="mt-3">
                {[...Array(Math.ceil(filteredReports.length / itemsPerPage)).keys()].map(number => (
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
          <CModalTitle>{isEditMode ? 'Edit Report' : 'Add New Report'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput type="text" name="name" label="Name" value={currentReport.name || ''} onChange={handleInputChange} className="mb-3" />
            <CFormSelect name="clientid" label="Client" value={currentReport.clientid || ''} onChange={handleInputChange} className="mb-3">
              <option value="">Select a Client</option>
              {clients.map(client => (
                <option key={client.clientid} value={client.clientid}>{client.name}</option>
              ))}
            </CFormSelect>
            <CFormInput type="date" name="startdate" label="Start Date" value={currentReport.startdate || ''} onChange={handleInputChange} className="mb-3" />
            <CFormInput type="date" name="enddate" label="End Date" value={currentReport.enddate || ''} onChange={handleInputChange} className="mb-3" />
            <CFormSelect name="status" label="Status" value={currentReport.status || 'draft'} onChange={handleInputChange} className="mb-3">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
            </CFormSelect>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSaveReport}>
            {isEditMode ? 'Update Report' : 'Save Report'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default Reports;
