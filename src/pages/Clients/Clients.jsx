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
} from '@coreui/react';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Clients</strong> <small>from Neon DB</small>
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
  );
};

export default Clients;
