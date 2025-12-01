#!/usr/bin/env node

/**
 * Test Suite for Family CRM API
 * 
 * Run with: npm test
 * Requires API to be running on http://localhost:3001
 */

import axios from 'axios'

const API_BASE = process.env.API_BASE || 'http://localhost:3001/api'
const API_KEY = process.env.API_KEY || 'change-me-in-production'

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  errors: []
}

// Helper to create axios instance with auth
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
  }
})

// Test helper functions
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

async function test(name, testFn) {
  try {
    await testFn()
    results.passed++
    console.log(`✅ ${name}`)
  } catch (error) {
    results.failed++
    results.errors.push({ name, error: error.message })
    console.error(`❌ ${name}: ${error.message}`)
  }
}

// Test data storage (for cleanup and cross-test references)
const testData = {
  personId: null,
  householdId: null,
  eventId: null,
  giftId: null,
  cardId: null
}

// ==================== HEALTH CHECK TESTS ====================

async function testHealthCheck() {
  await test('Health check endpoint', async () => {
    const response = await api.get('/health')
    assert(response.status === 200, 'Expected status 200')
    assert(response.data.success === true, 'Expected success: true')
    assert(response.data.data.status === 'ok', 'Expected status: ok')
  })
}

// ==================== AUTHENTICATION TESTS ====================

async function testAuthentication() {
  await test('API requires authentication', async () => {
    try {
      await axios.get(`${API_BASE}/people`)
      throw new Error('Should have failed without API key')
    } catch (error) {
      assert(error.response?.status === 401 || error.response?.status === 403, 
        'Expected 401/403 without API key')
    }
  })

  await test('API accepts valid API key', async () => {
    const response = await api.get('/people')
    assert(response.status === 200, 'Expected status 200 with valid API key')
  })
}

// ==================== PEOPLE TESTS ====================

async function testPeopleCRUD() {
  await test('Create person', async () => {
    const response = await api.post('/people', {
      display_name: 'Test Person',
      short_name: 'Test',
      relationship_label: 'Friend'
    })
    assert(response.status === 201, 'Expected status 201')
    assert(response.data.success === true, 'Expected success: true')
    assert(response.data.data.id, 'Expected person ID')
    assert(response.data.data.display_name === 'Test Person', 'Expected display name')
    testData.personId = response.data.data.id
  })

  await test('Get all people', async () => {
    const response = await api.get('/people')
    assert(response.status === 200, 'Expected status 200')
    assert(response.data.success === true, 'Expected success: true')
    assert(Array.isArray(response.data.data), 'Expected array of people')
    assert(response.data.data.length > 0, 'Expected at least one person')
  })

  await test('Get person by ID', async () => {
    const response = await api.get(`/people/${testData.personId}`)
    assert(response.status === 200, 'Expected status 200')
    assert(response.data.success === true, 'Expected success: true')
    assert(response.data.data.id === testData.personId, 'Expected matching person ID')
    assert(response.data.data.display_name === 'Test Person', 'Expected matching display name')
  })

  await test('Update person', async () => {
    const response = await api.patch(`/people/${testData.personId}`, {
      display_name: 'Updated Test Person'
    })
    assert(response.status === 200, 'Expected status 200')
    assert(response.data.success === true, 'Expected success: true')
    assert(response.data.data.display_name === 'Updated Test Person', 'Expected updated name')
  })

  await test('Delete person (soft delete)', async () => {
    const response = await api.delete(`/people/${testData.personId}`)
    assert(response.status === 200, 'Expected status 200')
    assert(response.data.success === true, 'Expected success: true')
    
    // Verify soft delete - should not appear in list
    const listResponse = await api.get('/people')
    const deletedPerson = listResponse.data.data.find(p => p.id === testData.personId)
    assert(!deletedPerson || deletedPerson.active === false, 'Person should be inactive')
  })
}

// ==================== HOUSEHOLDS TESTS ====================

async function testHouseholdsCRUD() {
  await test('Create household', async () => {
    const response = await api.post('/households', {
      name: 'Test Household',
      city: 'Test City'
    })
    assert(response.status === 201, 'Expected status 201')
    assert(response.data.success === true, 'Expected success: true')
    assert(response.data.data.id, 'Expected household ID')
    testData.householdId = response.data.data.id
  })

  await test('Get all households', async () => {
    const response = await api.get('/households')
    assert(response.status === 200, 'Expected status 200')
    assert(response.data.success === true, 'Expected success: true')
    assert(Array.isArray(response.data.data), 'Expected array of households')
  })

  await test('Get household by ID', async () => {
    const response = await api.get(`/households/${testData.householdId}`)
    assert(response.status === 200, 'Expected status 200')
    assert(response.data.success === true, 'Expected success: true')
    assert(response.data.data.id === testData.householdId, 'Expected matching household ID')
  })

  await test('Update household', async () => {
    const response = await api.patch(`/households/${testData.householdId}`, {
      name: 'Updated Test Household'
    })
    assert(response.status === 200, 'Expected status 200')
    assert(response.data.success === true, 'Expected success: true')
    assert(response.data.data.name === 'Updated Test Household', 'Expected updated name')
  })
}

// ==================== EVENTS TESTS ====================

async function testEventsCRUD() {
  await test('Create event', async () => {
    // Use unique name with timestamp to avoid conflicts
    const uniqueName = `Test Event ${Date.now()}`
    const response = await api.post('/events', {
      name: uniqueName,
      event_type: 'holiday',
      event_date: '2025-12-25'
    })
    assert(response.status === 201, 'Expected status 201')
    assert(response.data.success === true, 'Expected success: true')
    assert(response.data.data.id, 'Expected event ID')
    testData.eventId = response.data.data.id
  })

  await test('Get all events', async () => {
    const response = await api.get('/events')
    assert(response.status === 200, 'Expected status 200')
    assert(response.data.success === true, 'Expected success: true')
    assert(Array.isArray(response.data.data), 'Expected array of events')
  })

  await test('Get event by ID', async () => {
    if (!testData.eventId) {
      throw new Error('Event ID not set from previous test')
    }
    const response = await api.get(`/events/${testData.eventId}`)
    assert(response.status === 200, 'Expected status 200')
    assert(response.data.success === true, 'Expected success: true')
    assert(response.data.data.id === testData.eventId, 'Expected matching event ID')
  })

  await test('Update event', async () => {
    if (!testData.eventId) {
      throw new Error('Event ID not set from previous test')
    }
    const uniqueName = `Updated Test Event ${Date.now()}`
    const response = await api.patch(`/events/${testData.eventId}`, {
      name: uniqueName
    })
    assert(response.status === 200, 'Expected status 200')
    assert(response.data.success === true, 'Expected success: true')
    assert(response.data.data.name === uniqueName, 'Expected updated name')
  })
}

// ==================== GIFTS TESTS ====================

async function testGiftsCRUD() {
  // Create test person and household for gift tests
  let giverPerson, receiverPerson, giverHousehold
  
  await test('Create test data for gifts', async () => {
    const person1 = await api.post('/people', { display_name: 'Giver Person' })
    const person2 = await api.post('/people', { display_name: 'Receiver Person' })
    const household = await api.post('/households', { name: 'Giver Household' })
    
    giverPerson = person1.data.data.id
    receiverPerson = person2.data.data.id
    giverHousehold = household.data.data.id
  })

  await test('Create gift (inbound)', async () => {
    const response = await api.post('/gifts', {
      direction: 'in',
      event_id: testData.eventId,
      giver_person_id: giverPerson,
      receiver_person_id: receiverPerson,
      description: 'Test Gift',
      est_value: 25.00
    })
    assert(response.status === 201, 'Expected status 201')
    assert(response.data.success === true, 'Expected success: true')
    assert(response.data.data.id, 'Expected gift ID')
    assert(response.data.data.direction === 'in', 'Expected direction: in')
    testData.giftId = response.data.data.id
  })

  await test('Create gift (outbound)', async () => {
    const response = await api.post('/gifts', {
      direction: 'out',
      event_id: testData.eventId,
      giver_household_id: giverHousehold,
      receiver_person_id: receiverPerson,
      description: 'Outbound Test Gift',
      est_value: 50.00
    })
    assert(response.status === 201, 'Expected status 201')
    assert(response.data.success === true, 'Expected success: true')
    assert(response.data.data.direction === 'out', 'Expected direction: out')
  })

  await test('Get all gifts', async () => {
    const response = await api.get('/gifts')
    assert(response.status === 200, 'Expected status 200')
    assert(response.data.success === true, 'Expected success: true')
    assert(Array.isArray(response.data.data), 'Expected array of gifts')
  })

  await test('Get gift by ID', async () => {
    const response = await api.get(`/gifts/${testData.giftId}`)
    assert(response.status === 200, 'Expected status 200')
    assert(response.data.success === true, 'Expected success: true')
    assert(response.data.data.id === testData.giftId, 'Expected matching gift ID')
  })

  await test('Update gift', async () => {
    const response = await api.patch(`/gifts/${testData.giftId}`, {
      description: 'Updated Test Gift'
    })
    assert(response.status === 200, 'Expected status 200')
    assert(response.data.success === true, 'Expected success: true')
    assert(response.data.data.description === 'Updated Test Gift', 'Expected updated description')
  })

  await test('Get gifts filtered by direction', async () => {
    const response = await api.get('/gifts?direction=in')
    assert(response.status === 200, 'Expected status 200')
    assert(response.data.success === true, 'Expected success: true')
    assert(Array.isArray(response.data.data), 'Expected array of gifts')
    response.data.data.forEach(gift => {
      assert(gift.direction === 'in', 'All gifts should be inbound')
    })
  })
}

// ==================== CARDS TESTS ====================

async function testCardsCRUD() {
  await test('Create card', async () => {
    if (!testData.eventId || !testData.householdId) {
      throw new Error('Event ID or Household ID not set from previous tests')
    }
    const response = await api.post('/cards', {
      event_id: testData.eventId,
      household_id: testData.householdId,
      status: 'planned'
    })
    assert(response.status === 201, 'Expected status 201')
    assert(response.data.success === true, 'Expected success: true')
    assert(response.data.data.id, 'Expected card ID')
    testData.cardId = response.data.data.id
  })

  await test('Get all cards', async () => {
    const response = await api.get('/cards')
    assert(response.status === 200, 'Expected status 200')
    assert(response.data.success === true, 'Expected success: true')
    assert(Array.isArray(response.data.data), 'Expected array of cards')
  })

  await test('Get card by ID', async () => {
    if (!testData.cardId) {
      throw new Error('Card ID not set from previous test')
    }
    const response = await api.get(`/cards/${testData.cardId}`)
    assert(response.status === 200, 'Expected status 200')
    assert(response.data.success === true, 'Expected success: true')
    assert(response.data.data.id === testData.cardId, 'Expected matching card ID')
  })

  await test('Update card', async () => {
    if (!testData.cardId) {
      throw new Error('Card ID not set from previous test')
    }
    const response = await api.patch(`/cards/${testData.cardId}`, {
      status: 'sent'
    })
    assert(response.status === 200, 'Expected status 200')
    assert(response.data.success === true, 'Expected success: true')
    assert(response.data.data.status === 'sent', 'Expected updated status')
  })
}

// ==================== IMPORT TESTS ====================

async function testImportAPIs() {
  await test('Import people', async () => {
    const response = await api.post('/import/people', {
      people: [
        { display_name: 'Imported Person 1', short_name: 'IP1' },
        { display_name: 'Imported Person 2', short_name: 'IP2' }
      ]
    })
    assert(response.status === 200, 'Expected status 200')
    assert(response.data.success === true, 'Expected success: true')
    assert(response.data.data.people_created >= 0, 'Expected people_created count')
    assert(response.data.data.households_created >= 0, 'Expected households_created count')
  })

  await test('Import gifts', async () => {
    // Use the event we created earlier, or create a new one
    let eventId = testData.eventId
    if (!eventId) {
      // Create a test event for import
      const eventResponse = await api.post('/events', {
        name: `Import Test Event ${Date.now()}`,
        event_type: 'gift_exchange'
      })
      eventId = eventResponse.data.data.id
    }
    
    const response = await api.post('/import/gifts', {
      gifts: [
        {
          direction: 'in',
          event_name: `Import Test Event ${Date.now()}`,
          giver_name: 'Imported Person 1',
          receiver_name: 'Imported Person 2',
          description: 'Imported Gift',
          est_value: 30.00
        }
      ]
    })
    assert(response.status === 200, 'Expected status 200')
    assert(response.data.success === true, 'Expected success: true')
    assert(response.data.data.created >= 0, 'Expected created count')
  })
}

// ==================== HOUSEHOLD MERGE TESTS ====================

async function testHouseholdMerge() {
  await test('Merge households', async () => {
    // Create two households
    const h1 = await api.post('/households', { name: 'Household 1' })
    const h2 = await api.post('/households', { name: 'Household 2' })
    const household1Id = h1.data.data.id
    const household2Id = h2.data.data.id

    // Merge household 2 into household 1
    const response = await api.post('/households/merge', {
      source_household_id: household2Id,
      target_household_id: household1Id
    })
    assert(response.status === 200, 'Expected status 200')
    assert(response.data.success === true, 'Expected success: true')
    assert(response.data.data.people_moved >= 0, 'Expected people_moved count')
    
    // Verify household 2 is deleted (soft delete)
    const getResponse = await api.get(`/households/${household2Id}`)
    assert(getResponse.data.data.active === false, 'Merged household should be inactive')
  })
}

// ==================== MAIN TEST RUNNER ====================

async function runAllTests() {
  console.log('\n🧪 Running Family CRM API Tests\n')
  console.log(`API Base: ${API_BASE}`)
  console.log('=' .repeat(50) + '\n')

  try {
    // Run test suites
    await testHealthCheck()
    await testAuthentication()
    await testPeopleCRUD()
    await testHouseholdsCRUD()
    await testEventsCRUD()
    await testGiftsCRUD()
    await testCardsCRUD()
    await testImportAPIs()
    await testHouseholdMerge()

    // Print summary
    console.log('\n' + '='.repeat(50))
    console.log('\n📊 Test Summary:')
    console.log(`✅ Passed: ${results.passed}`)
    console.log(`❌ Failed: ${results.failed}`)
    console.log(`📈 Total:  ${results.passed + results.failed}`)

    if (results.errors.length > 0) {
      console.log('\n❌ Failed Tests:')
      results.errors.forEach(({ name, error }) => {
        console.log(`   - ${name}: ${error}`)
      })
    }

    console.log('\n')
    process.exit(results.failed > 0 ? 1 : 0)
  } catch (error) {
    console.error('\n💥 Fatal error running tests:', error)
    process.exit(1)
  }
}

// Run tests
runAllTests()

