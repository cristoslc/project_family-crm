import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './TabBar.css'

function TabBar() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path

  const tabs = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/gifts/log', label: 'Log Gift', icon: '🎁' },
    { path: '/people', label: 'People', icon: '👥' },
    { path: '/households', label: 'Households', icon: '🏘️' },
    { path: '/events', label: 'Events', icon: '📅' }
  ]

  return (
    <nav className="tab-bar">
      {tabs.map(tab => (
        <Link
          key={tab.path}
          to={tab.path}
          className={`tab-item ${isActive(tab.path) ? 'active' : ''}`}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </Link>
      ))}
    </nav>
  )
}

export default TabBar
