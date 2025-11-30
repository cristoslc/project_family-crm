import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './NavBar.css'

function NavBar() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Family Gift Tracker</Link>
      </div>
      <div className="navbar-links">
        <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
        <Link to="/people" className={isActive('/people') ? 'active' : ''}>People</Link>
        <Link to="/households" className={isActive('/households') ? 'active' : ''}>Households</Link>
        <Link to="/events" className={isActive('/events') ? 'active' : ''}>Events</Link>
        <Link to="/gifts" className={isActive('/gifts') ? 'active' : ''}>Gifts</Link>
        <Link to="/cards" className={isActive('/cards') ? 'active' : ''}>Cards</Link>
      </div>
    </nav>
  )
}

export default NavBar
