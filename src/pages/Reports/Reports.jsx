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
  CFormTextarea,
} from '@coreui/react';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newReport, setNewReport] = useState({ 
    name: '', 
    summary: '', 
    clientid: '', 
    verticalid: '', 
    createdbyuserid: '', 
    status: 'draft' 
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reports');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setReports(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleSaveReport = async () => {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReport),
      });

      if (!response.ok) {
        throw new Error('Failed to create report');
      }

      const createdReport = await response.json();

      // Add the new report to the top of the list
      setReports([createdReport, ...reports]);

      // Reset form and close modal
      setNewReport({ 
        name: '', 
        summary: '', 
        clientid: '', 
        verticalid: '', 
        createdbyuserid: '', 
        status: 'draft' 
      });
      setModalVisible(false);

    } catch (e) {
      // You might want to show this error in the modal
      setError(e.message);
      console.error('Save report error:', e);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <span>
                <strong>Reports</strong> <small>from Neon DB</small>
              </span>
              <CButton color="primary" onClick={() => setModalVisible(true)} >
                Add Report
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            {loading && <p>Loading reports...</p>}
            {error && <p style={{ color: 'red' }}>Error fetching reports: {error}</p>}
            {!loading && !error && (
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col"># ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Summary</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Created</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {reports.map((report) => (
                    <CTableRow key={report.reportid}>
                      <CTableHeaderCell scope="row">{report.reportid}</CTableHeaderCell>
                      <CTableDataCell>{report.name}</CTableDataCell>
                      <CTableDataCell>
                        {report.summary ? 
                          (report.summary.length > 50 ? 
                            `${report.summary.substring(0, 50)}...` : 
                            report.summary
                          ) : 
                          'No summary'
                        }
                      </CTableDataCell>
                      <CTableDataCell>{report.status || 'draft'}</CTableDataCell>
                      <CTableDataCell>{formatDate(report.createdat)}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
             {reports.length === 0 && !loading && <p>No reports found.</p>}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CModal visible={isModalVisible} onClose={() => setModalVisible(false)}>
      <CModalHeader onClose={() => setModalVisible(false)}>
        <CModalTitle>Add New Report</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <div className="mb-3">
            <CFormLabel htmlFor="reportName">Name *</CFormLabel>
            <CFormInput
              type="text"
              id="reportName"
              value={newReport.name}
              onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
              placeholder="Enter report name"
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="reportSummary">Summary</CFormLabel>
            <CFormTextarea
              id="reportSummary"
              rows={3}
              value={newReport.summary}
              onChange={(e) => setNewReport({ ...newReport, summary: e.target.value })}
              placeholder="Enter report summary (optional)"
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="clientId">Client ID</CFormLabel>
            <CFormInput
              type="number"
              id="clientId"
              value={newReport.clientid}
              onChange={(e) => setNewReport({ ...newReport, clientid: e.target.value })}
              placeholder="Enter client ID (optional)"
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="verticalId">Vertical ID</CFormLabel>
            <CFormInput
              type="number"
              id="verticalId"
              value={newReport.verticalid}
              onChange={(e) => setNewReport({ ...newReport, verticalid: e.target.value })}
              placeholder="Enter vertical ID (optional)"
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="createdByUserId">Created By User ID</CFormLabel>
            <CFormInput
              type="number"
              id="createdByUserId"
              value={newReport.createdbyuserid}
              onChange={(e) => setNewReport({ ...newReport, createdbyuserid: e.target.value })}
              placeholder="Enter user ID (optional)"
            />
          </div>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setModalVisible(false)}>
          Cancel
        </CButton>
        <CButton color="primary" onClick={handleSaveReport}>Save Report</CButton>
      </CModalFooter>
    </CModal>
    </>
  );
};

export default Reports;
