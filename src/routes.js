import React from 'react'

// Phase 1 pages (VibeAccelerate)
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'))
const NewBrief = React.lazy(() => import('./pages/NewBrief/NewBrief'))
const BriefSummary = React.lazy(() => import('./pages/BriefSummary/BriefSummary'))
const Feedback = React.lazy(() => import('./pages/Feedback/Feedback'))
const Profile = React.lazy(() => import('./pages/Profile/Profile'))
const Report = React.lazy(() => import('./pages/Report/Report'))
const ReportViewer = React.lazy(() => import('./pages/ReportViewer/ReportViewer'))
const ReportsList = React.lazy(() => import('./pages/ReportsList'))
const TemplatesAdmin = React.lazy(() => import('./pages/Templates/Templates'))
const SectionsAdmin = React.lazy(() => import('./pages/Sections/Sections'))
const AdminMockReports = React.lazy(() => import('./pages/AdminMockReports'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/brief/new', name: 'Nuevo Brief', element: NewBrief },
  { path: '/brief/summary', name: 'Resumen Brief', element: BriefSummary },
  { path: '/feedback', name: 'Feedback', element: Feedback },
  { path: '/profile', name: 'Perfil', element: Profile },
  { path: '/report', name: 'Reportes', element: ReportsList },
  // Read-only viewer route, no editor controls
  { path: '/report/view/:reportId', name: 'Ver Reporte', element: ReportViewer },
  { path: '/report/:templateId', name: 'Report Template', element: Report },
  { path: '/templates', name: 'Templates Admin', element: TemplatesAdmin },
  { path: '/sections', name: 'Sections Admin', element: SectionsAdmin },
  { path: '/admin/mock-reports', name: 'Mock Reports', element: AdminMockReports },
]

export default routes
