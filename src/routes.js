import React from 'react'

// Phase 1 pages (VibeAccelerate)
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'))
const NewBrief = React.lazy(() => import('./pages/NewBrief/NewBrief'))
const BriefSummary = React.lazy(() => import('./pages/BriefSummary/BriefSummary'))
const Feedback = React.lazy(() => import('./pages/Feedback/Feedback'))
const Profile = React.lazy(() => import('./pages/Profile/Profile'))
const Report = React.lazy(() => import('./pages/Report/Report'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/brief/new', name: 'Nuevo Brief', element: NewBrief },
  { path: '/brief/summary', name: 'Resumen Brief', element: BriefSummary },
  { path: '/feedback', name: 'Feedback', element: Feedback },
  { path: '/profile', name: 'Perfil', element: Profile },
  { path: '/report', name: 'Report Builder', element: Report },
]

export default routes
