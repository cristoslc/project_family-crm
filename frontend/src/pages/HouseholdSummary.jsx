import React, { useState, useEffect } from 'react'
import apiClient from '../services/api'
import './HouseholdSummary.css'

function HouseholdSummary() {
  const [households, setHouseholds] = useState([])
  const [gifts, setGifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadData()
  }, [selectedYear])

  const loadData = async () => {
    try {
      setLoading(true)
      const [householdsRes, giftsRes] = await Promise.all([
        apiClient.get('/households'),
        apiClient.get('/gifts')
      ])
      setHouseholds(householdsRes.data.data || [])
      setGifts(giftsRes.data.data || [])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHouseholdSummary = (householdId) => {
    const householdGifts = gifts.filter(gift => {
      const giftYear = gift.given_date ? new Date(gift.given_date).getFullYear() : new Date().getFullYear()
      return giftYear === selectedYear && (
        gift.giver_household_id === householdId ||
        gift.receiver_household_id === householdId
      )
    })

    const given = householdGifts
      .filter(g => g.direction === 'out' && g.giver_household_id === householdId)
      .reduce((sum, g) => sum + (parseFloat(g.est_value) || 0), 0)

    const received = householdGifts
      .filter(g => g.direction === 'in' && g.receiver_household_id === householdId)
      .reduce((sum, g) => sum + (parseFloat(g.est_value) || 0), 0)

    return {
      given,
      received,
      net: received - given,
      count: householdGifts.length
    }
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  if (loading) {
    return <div className="page-container">Loading...</div>
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Household Summary</h1>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="year-selector"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="summary-list">
        {households.length === 0 ? (
          <div className="empty-state">No households found</div>
        ) : (
          households.map(household => {
            const summary = getHouseholdSummary(household.id)
            return (
              <div key={household.id} className="summary-item">
                <div className="summary-header">
                  <div className="summary-name">{household.name}</div>
                  <div className={`summary-net ${summary.net >= 0 ? 'positive' : 'negative'}`}>
                    ${Math.abs(summary.net).toFixed(2)} {summary.net >= 0 ? '↑' : '↓'}
                  </div>
                </div>
                <div className="summary-details">
                  <div className="summary-detail">
                    <span className="detail-label">Given:</span>
                    <span className="detail-value">${summary.given.toFixed(2)}</span>
                  </div>
                  <div className="summary-detail">
                    <span className="detail-label">Received:</span>
                    <span className="detail-value">${summary.received.toFixed(2)}</span>
                  </div>
                  <div className="summary-detail">
                    <span className="detail-label">Gifts:</span>
                    <span className="detail-value">{summary.count}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default HouseholdSummary
