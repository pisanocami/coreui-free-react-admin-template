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
  CFormLabel,
} from '@coreui/react';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', industry: '', maincontact: '' });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/clients');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setClients(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleSaveClient = async () => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClient),
      });

      if (!response.ok) {
        throw new Error('Failed to create client');
      }

      const createdClient = await response.json();

      // Add the new client to the top of the list
      setClients([createdClient, ...clients]);

      // Reset form and close modal
      setNewClient({ name: '', industry: '', maincontact: '' });
      setModalVisible(false);

    } catch (e) {
      // You might want to show this error in the modal
      setError(e.message);
      console.error('Save client error:', e);
    }
  };

  return (
    <>
      <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <span>
                <strong>Clients</strong> <small>from Neon DB</small>
              </span>
              <CButton color="primary" onClick={() => setModalVisible(true)} >
                Add Client
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            {loading && <p>Loading clients...</p>}
            {error && <p style={{ color: 'red' }}>Error fetching clients: {error}</p>}
            {!loading && !error && (
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col"># ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Industry</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {clients.map((client) => (
                    <CTableRow key={client.clientid}>
                      <CTableHeaderCell scope="row">{client.clientid}</CTableHeaderCell>
                      <CTableDataCell>{client.name}</CTableDataCell>
                      <CTableDataCell>{client.industry}</CTableDataCell>
                      <CTableDataCell>{client.status}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
             {clients.length === 0 && !loading && <p>No clients found.</p>}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CModal visible={isModalVisible} onClose={() => setModalVisible(false)}>
      <CModalHeader onClose={() => setModalVisible(false)}>
        <CModalTitle>Add New Client</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <div className="mb-3">
            <CFormLabel htmlFor="clientName">Name</CFormLabel>
            <CFormInput
              type="text"
              id="clientName"
              value={newClient.name}
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="clientIndustry">Industry</CFormLabel>
            <CFormInput
              type="text"
              id="clientIndustry"
              value={newClient.industry}
              onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="clientContact">Main Contact</CFormLabel>
            <CFormInput
              type="text"
              id="clientContact"
              value={newClient.maincontact}
              onChange={(e) => setNewClient({ ...newClient, maincontact: e.target.value })}
            />
          </div>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setModalVisible(false)}>
          Cancel
        </CButton>
        <CButton color="primary" onClick={handleSaveClient}>Save Client</CButton>
      </CModalFooter>
    </CModal>
    </>
  );
};

export default Clients;
