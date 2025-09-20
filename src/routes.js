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
const Clients = React.lazy(() => import('./pages/Clients/Clients'))
const Reports = React.lazy(() => import('./pages/Reports/Reports'))
const ReportView = React.lazy(() => import('./pages/ReportView/ReportView'))
const Verticals = React.lazy(() => import('./pages/Verticals/Verticals'))
const Competitors = React.lazy(() => import('./pages/Competitors/Competitors'))
const Users = React.lazy(() => import('./pages/Users/Users'))
const Tags = React.lazy(() => import('./pages/Tags/Tags'))
const Metrics = React.lazy(() => import('./pages/Metrics/Metrics'))
const Entities = React.lazy(() => import('./pages/Entities/Entities'))
const SocialProfiles = React.lazy(() => import('./pages/SocialProfiles/SocialProfiles'))
const Reviews = React.lazy(() => import('./pages/Reviews/Reviews'))
const AdCreatives = React.lazy(() => import('./pages/AdCreatives/AdCreatives'))
const ReportSections = React.lazy(() => import('./pages/ReportSections/ReportSections'))
const SectionItems = React.lazy(() => import('./pages/SectionItems/SectionItems'))
const Insights = React.lazy(() => import('./pages/Insights/Insights'))
const MetricValues = React.lazy(() => import('./pages/MetricValues/MetricValues'))
const ReportMedia = React.lazy(() => import('./pages/ReportMedia/ReportMedia'))
const ReportTags = React.lazy(() => import('./pages/ReportTags/ReportTags'))

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
  { path: '/clients', name: 'Clients', element: Clients },
  { path: '/reports', name: 'Reports', element: Reports },
  { path: '/report-view', name: 'Visualización de Reportes', element: ReportView },
  { path: '/verticals', name: 'Verticals', element: Verticals },
  { path: '/competitors', name: 'Competitors', element: Competitors },
  { path: '/users', name: 'Users', element: Users },
  { path: '/tags', name: 'Tags', element: Tags },
  { path: '/metrics', name: 'Metrics', element: Metrics },
  { path: '/entities', name: 'Entities', element: Entities },
  { path: '/social-profiles', name: 'Social Profiles', element: SocialProfiles },
  { path: '/reviews', name: 'Reviews', element: Reviews },
  { path: '/ad-creatives', name: 'Ad Creatives', element: AdCreatives },
  { path: '/report-sections', name: 'Report Sections', element: ReportSections },
  { path: '/section-items', name: 'Section Items', element: SectionItems },
  { path: '/insights', name: 'Insights', element: Insights },
  { path: '/metric-values', name: 'Metric Values', element: MetricValues },
  { path: '/report-media', name: 'Report Media', element: ReportMedia },
  { path: '/report-tags', name: 'Report Tags', element: ReportTags },
  // --> ADD NEW PAGE ROUTES HERE <--
  // See README_NEON.md, section '3. Crear la Página en el Frontend' for instructions.
]

export default routes
