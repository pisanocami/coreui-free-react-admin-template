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
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

// Sidebar navigation configuration
const _nav = [
  {
    component: CNavItem,
    name: 'Reportes',
    to: '/report',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Perfil',
    to: '/profile',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
  },
]

// Show admin links only in development to avoid clutter in production
if (import.meta && import.meta.env && import.meta.env.DEV) {
  _nav.push(
    { component: CNavTitle, name: 'Administración' },
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
      name: 'Mock Reports',
      to: '/admin/mock-reports',
      icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    },
  )
}

export default _nav
