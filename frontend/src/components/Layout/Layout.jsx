import React from 'react'
import NavBar from './NavBar'
import TabBar from './TabBar'
import './Layout.css'

function Layout({ children }) {
  return (
    <div className="layout">
      <NavBar />
      <main className="main-content">
        {children}
      </main>
      <TabBar />
    </div>
  )
}

export default Layout
