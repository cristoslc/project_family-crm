import { Person } from '../models/Person.js'
import { Household } from '../models/Household.js'
import { Event } from '../models/Event.js'
import { Gift } from '../models/Gift.js'
import pool from '../db/connection.js'

// Helper to find or create household by name
async function findOrCreateHousehold(name) {
  if (!name) return null
  
  const result = await pool.query(
    'SELECT * FROM households WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) AND active = true',
    [name]
  )
  
  if (result.rows.length > 0) {
    return result.rows[0]
  }
  
  // Create new household
  return await Household.create({ name })
}

// Helper to find or create person by name
async function findOrCreatePerson(displayName, householdId = null) {
  if (!displayName) return null
  
  const result = await pool.query(
    'SELECT * FROM people WHERE LOWER(TRIM(display_name)) = LOWER(TRIM($1)) AND active = true',
    [displayName]
  )
  
  if (result.rows.length > 0) {
    // Update household if provided
    if (householdId && result.rows[0].household_id !== householdId) {
      await Person.update(result.rows[0].id, { household_id: householdId })
      result.rows[0].household_id = householdId
    }
    return result.rows[0]
  }
  
  // Create new person
  return await Person.create({ display_name: displayName, household_id: householdId })
}

export const importGifts = async (req, res) => {
  try {
    const { gifts } = req.body
    
    if (!Array.isArray(gifts)) {
      return res.status(400).json({ success: false, error: 'gifts must be an array' })
    }

    let created = 0
    let updated = 0
    const errors = []

    for (const giftData of gifts) {
      try {
        const {
          direction,
          giver_name,
          giver_household_name,
          receiver_name,
          receiver_household_name,
          description,
          est_value,
          event_name,
          given_date,
          recorded_by = 'imported',
          visibility_hint = 'public'
        } = giftData

        if (!direction || !description) {
          errors.push({ gift: giftData, error: 'direction and description are required' })
          continue
        }

        // Find or create event
        let event = null
        if (event_name) {
          event = await Event.findByName(event_name)
          if (!event) {
            event = await Event.create({
              name: event_name,
              event_type: 'gift_exchange',
              event_date: given_date || null
            })
          }
        }

        // Find or create giver
        let giverPerson = null
        let giverHousehold = null
        if (giver_name) {
          giverPerson = await findOrCreatePerson(giver_name)
        }
        if (giver_household_name) {
          giverHousehold = await findOrCreateHousehold(giver_household_name)
          if (giverPerson && giverHousehold) {
            await Person.update(giverPerson.id, { household_id: giverHousehold.id })
          }
        }

        // Find or create receiver
        let receiverPerson = null
        let receiverHousehold = null
        if (receiver_name) {
          // Handle special cases like "Me", "Spouse"
          if (receiver_name.toLowerCase() === 'me' || receiver_name.toLowerCase() === 'spouse') {
            receiverPerson = await findOrCreatePerson(receiver_name)
          } else {
            receiverPerson = await findOrCreatePerson(receiver_name)
          }
        }
        if (receiver_household_name) {
          receiverHousehold = await findOrCreateHousehold(receiver_household_name)
        }

        // Create gift
        await Gift.create({
          direction,
          event_id: event ? event.id : null,
          giver_person_id: giverPerson ? giverPerson.id : null,
          giver_household_id: giverHousehold ? giverHousehold.id : null,
          receiver_person_id: receiverPerson ? receiverPerson.id : null,
          receiver_household_id: receiverHousehold ? receiverHousehold.id : null,
          description,
          est_value: est_value ? parseFloat(est_value) : null,
          given_date,
          recorded_by,
          visibility_hint
        })

        created++
      } catch (error) {
        errors.push({ gift: giftData, error: error.message })
      }
    }

    res.json({
      success: true,
      data: {
        created,
        updated,
        errors: errors.length > 0 ? errors : undefined
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const importPeople = async (req, res) => {
  try {
    const { people } = req.body
    
    if (!Array.isArray(people)) {
      return res.status(400).json({ success: false, error: 'people must be an array' })
    }

    let peopleCreated = 0
    let householdsCreated = 0
    const errors = []
    const createdHouseholds = new Map()

    for (const personData of people) {
      try {
        const {
          display_name,
          household_name,
          relationship_label,
          is_child = false,
          notes
        } = personData

        if (!display_name) {
          errors.push({ person: personData, error: 'display_name is required' })
          continue
        }

        // Find or create household
        let householdId = null
        if (household_name) {
          if (!createdHouseholds.has(household_name)) {
            const household = await findOrCreateHousehold(household_name)
            createdHouseholds.set(household_name, household)
            if (!household.id) {
              // New household was created
              householdsCreated++
            }
          }
          householdId = createdHouseholds.get(household_name).id
        }

        // Check if person exists first
        const existingCheck = await pool.query(
          'SELECT * FROM people WHERE LOWER(TRIM(display_name)) = LOWER(TRIM($1)) AND active = true',
          [display_name]
        )
        
        const isNewPerson = existingCheck.rows.length === 0
        
        // Find or create person
        const person = await findOrCreatePerson(display_name, householdId)
        
        if (isNewPerson) {
          peopleCreated++
        }
        
        // Update with additional fields
        await Person.update(person.id, {
          household_id: householdId,
          relationship_label,
          notes,
          is_child
        })
      } catch (error) {
        errors.push({ person: personData, error: error.message })
      }
    }

    res.json({
      success: true,
      data: {
        people_created: peopleCreated,
        households_created: householdsCreated,
        errors: errors.length > 0 ? errors : undefined
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
