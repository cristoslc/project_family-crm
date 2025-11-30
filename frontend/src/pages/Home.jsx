import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../services/api'
import './Home.css'

function Home() {
  const [stats, setStats] = useState({ giftsReceived: 0, giftsGiven: 0, cardsPlanned: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [giftsIn, giftsOut, cards] = await Promise.all([
        apiClient.get('/gifts?direction=in'),
        apiClient.get('/gifts?direction=out'),
        apiClient.get('/cards?status=planned')
      ])
      
      setStats({
        giftsReceived: giftsIn.data.data?.length || 0,
        giftsGiven: giftsOut.data.data?.length || 0,
        cardsPlanned: cards.data.data?.length || 0
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home">
      <div className="home-header">
        <h1>Family Gift Tracker</h1>
        <p>Manage gifts, relationships, and holiday events</p>
      </div>

      <div className="quick-actions">
        <Link to="/gifts/log" className="action-button primary">
          <span className="action-icon">🎁</span>
          <span className="action-label">Log Gift Received</span>
        </Link>
        <Link to="/gifts/log/given" className="action-button secondary">
          <span className="action-icon">📤</span>
          <span className="action-label">Log Gift We're Giving</span>
        </Link>
        <Link to="/gifts" className="action-button secondary">
          <span className="action-icon">📋</span>
          <span className="action-label">Today's Gifts</span>
        </Link>
        <Link to="/households/summary" className="action-button secondary">
          <span className="action-icon">📊</span>
          <span className="action-label">Household Summary</span>
        </Link>
      </div>

      {!loading && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.giftsReceived}</div>
            <div className="stat-label">Gifts Received</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.giftsGiven}</div>
            <div className="stat-label">Gifts Given</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.cardsPlanned}</div>
            <div className="stat-label">Cards Planned</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
