import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import PeopleList from './pages/PeopleList'
import PersonDetail from './pages/PersonDetail'
import HouseholdsList from './pages/HouseholdsList'
import HouseholdDetail from './pages/HouseholdDetail'
import EventsList from './pages/EventsList'
import EventDetail from './pages/EventDetail'
import GiftsList from './pages/GiftsList'
import LogGiftReceived from './pages/LogGiftReceived'
import LogGiftGiven from './pages/LogGiftGiven'
import CardsManagement from './pages/CardsManagement'
import HouseholdSummary from './pages/HouseholdSummary'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/people" element={<PeopleList />} />
          <Route path="/people/:id" element={<PersonDetail />} />
          <Route path="/households" element={<HouseholdsList />} />
          <Route path="/households/:id" element={<HouseholdDetail />} />
          <Route path="/households/summary" element={<HouseholdSummary />} />
          <Route path="/events" element={<EventsList />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/gifts" element={<GiftsList />} />
          <Route path="/gifts/log" element={<LogGiftReceived />} />
          <Route path="/gifts/log/given" element={<LogGiftGiven />} />
          <Route path="/cards" element={<CardsManagement />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
