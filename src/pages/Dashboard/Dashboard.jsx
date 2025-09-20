import React, { useState, useEffect } from 'react'
import { CContainer, CRow, CCol, CButton } from '@coreui/react'
import { CChartBar, CChartPie, CChartLine } from '@coreui/react-chartjs'

const Dashboard = () => {
  const [reportsByClient, setReportsByClient] = useState([]);
  const [entitiesByType, setEntitiesByType] = useState([]);
  const [usersByMonth, setUsersByMonth] = useState([]);

  useEffect(() => {
    // Fetch reports by client statistics
    fetch('/api/stats/reports-by-client')
      .then(response => response.json())
      .then(data => setReportsByClient(data))
      .catch(error => console.error('Error fetching reports by client:', error));

    // Fetch entities by type statistics
    fetch('/api/stats/entities-by-type')
      .then(response => response.json())
      .then(data => setEntitiesByType(data))
      .catch(error => console.error('Error fetching entities by type:', error));

    // Fetch users by month statistics
    fetch('/api/stats/users-by-month')
      .then(response => response.json())
      .then(data => setUsersByMonth(data))
      .catch(error => console.error('Error fetching users by month:', error));
  }, []);

  return (
    <main aria-label="Contenido principal: Dashboard">
      <CContainer fluid>
        <CRow className="mb-4">
          <CCol>
            <h1 className="h3">Dashboard</h1>
            <p className="text-medium-emphasis">Resumen ejecutivo de proyectos activos.</p>
          </CCol>
          <CCol xs="12" sm="auto" className="text-sm-end">
            <CButton color="primary" href="#/brief/new" aria-label="Crear nuevo brief">
              Nuevo Brief
            </CButton>
          </CCol>
        </CRow>
        
        <CRow className="mb-4">
          <CCol md="6">
            <h4>Reportes por Cliente</h4>
            <CChartBar
              data={{
                labels: reportsByClient.map(item => item.clientName),
                datasets: [
                  {
                    label: 'Número de Reportes',
                    backgroundColor: '#2563eb',
                    data: reportsByClient.map(item => item.reportCount),
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    labels: {
                      color: '#1e293b',
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: '#1e293b',
                    },
                  },
                  x: {
                    ticks: {
                      color: '#1e293b',
                    },
                  },
                },
              }}
              height="300"
            />
          </CCol>
          <CCol md="6">
            <h4>Entidades por Tipo</h4>
            <CChartPie
              data={{
                labels: entitiesByType.map(item => item.entityType),
                datasets: [
                  {
                    data: entitiesByType.map(item => item.entityCount),
                    backgroundColor: [
                      '#2563eb',
                      '#64748b',
                      '#10b981',
                      '#ef4444',
                      '#f59e0b',
                      '#8b5cf6',
                    ],
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    labels: {
                      color: '#1e293b',
                    },
                  },
                },
              }}
              height="300"
            />
          </CCol>
        </CRow>
        
        <CRow className="mb-4">
          <CCol>
            <h4>Nuevos Usuarios por Mes</h4>
            <CChartLine
              data={{
                labels: usersByMonth.map(item => new Date(item.month).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })),
                datasets: [
                  {
                    label: 'Número de Usuarios',
                    backgroundColor: 'rgba(37, 99, 235, 0.2)',
                    borderColor: '#2563eb',
                    pointBackgroundColor: '#2563eb',
                    data: usersByMonth.map(item => item.userCount),
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    labels: {
                      color: '#1e293b',
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: '#1e293b',
                    },
                  },
                  x: {
                    ticks: {
                      color: '#1e293b',
                    },
                  },
                },
              }}
              height="300"
            />
          </CCol>
        </CRow>
      </CContainer>
    </main>
  )
}

export default Dashboard
