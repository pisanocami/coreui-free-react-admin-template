import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilExternalLink,
  cilLayers,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilShareAlt,
  cilCommentBubble,
  cilImage,
  cilLibrary,
  cilList,
  cilLightbulb,
  cilBarChart,
  cilMovie,
  cilTags,
  cilPeople,
  cilUser,
  cilTag,
  cilSpeedometer,
  cilStar,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

// Sidebar navigation configuration
const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Gestión de Clientes',
  },
  {
    component: CNavItem,
    name: 'Clients',
    to: '/clients',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Verticals',
    to: '/verticals',
    icon: <CIcon icon={cilLayers} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Competitors',
    to: '/competitors',
    icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Reportes y Análisis',
  },
  {
    component: CNavItem,
    name: 'Reports',
    to: '/reports',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Visualización de Reportes',
    to: '/report-view',
    icon: <CIcon icon={cilExternalLink} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Report Sections',
    to: '/report-sections',
    icon: <CIcon icon={cilLibrary} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Section Items',
    to: '/section-items',
    icon: <CIcon icon={cilList} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Insights',
    to: '/insights',
    icon: <CIcon icon={cilLightbulb} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Entidades',
  },
  {
    component: CNavItem,
    name: 'Entities',
    to: '/entities',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Social Profiles',
    to: '/social-profiles',
    icon: <CIcon icon={cilShareAlt} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Reviews',
    to: '/reviews',
    icon: <CIcon icon={cilCommentBubble} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Ad Creatives',
    to: '/ad-creatives',
    icon: <CIcon icon={cilImage} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Report Media',
    to: '/report-media',
    icon: <CIcon icon={cilMovie} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Configuración',
  },
  {
    component: CNavItem,
    name: 'Users',
    to: '/users',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Tags',
    to: '/tags',
    icon: <CIcon icon={cilTags} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Report Tags',
    to: '/report-tags',
    icon: <CIcon icon={cilTag} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Metrics',
    to: '/metrics',
    icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Metric Values',
    to: '/metric-values',
    icon: <CIcon icon={cilBarChart} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Plantillas',
    to: '/templates',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Secciones',
    to: '/sections',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Perfil',
    to: '/profile',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
  },
]

// Show admin links in development OR when explicitly enabled via env
// To enable in production, set VITE_SHOW_ADMIN=true in the environment
const showAdmin =
  (import.meta && import.meta.env && import.meta.env.DEV) ||
  (import.meta && import.meta.env && import.meta.env.VITE_SHOW_ADMIN === 'true')

if (showAdmin) {
  _nav.push(
    {
      component: CNavItem,
      name: 'Mock Reports',
      to: '/admin/mock-reports',
      icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    },
  )
}

export default _nav
