import { Household } from '../models/Household.js'
import pool from '../db/connection.js'

export const getAllHouseholds = async (req, res) => {
  try {
    const households = await Household.findAll()
    res.json({ success: true, data: households })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const getHouseholdById = async (req, res) => {
  try {
    const includeMembers = req.query.include_members === 'true'
    const household = includeMembers
      ? await Household.findByIdWithMembers(parseInt(req.params.id))
      : await Household.findById(parseInt(req.params.id))
    
    if (!household) {
      return res.status(404).json({ success: false, error: 'Household not found' })
    }
    res.json({ success: true, data: household })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const createHousehold = async (req, res) => {
  try {
    const { name, address_line_1, address_line_2, city, region, postal_code, country, card_greeting_name, notes } = req.body
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'name is required' })
    }

    const household = await Household.create({
      name,
      address_line_1,
      address_line_2,
      city,
      region,
      postal_code,
      country,
      card_greeting_name,
      notes
    })
    
    res.status(201).json({ success: true, data: household })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const updateHousehold = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const household = await Household.findById(id)
    
    if (!household) {
      return res.status(404).json({ success: false, error: 'Household not found' })
    }

    const updated = await Household.update(id, req.body)
    res.json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const deleteHousehold = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const household = await Household.findById(id)
    
    if (!household) {
      return res.status(404).json({ success: false, error: 'Household not found' })
    }

    await Household.softDelete(id)
    res.json({ success: true, message: 'Household deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const mergeHouseholds = async (req, res) => {
  try {
    const { source_household_id, target_household_id } = req.body

    if (!source_household_id || !target_household_id) {
      return res.status(400).json({ success: false, error: 'source_household_id and target_household_id are required' })
    }

    if (source_household_id === target_household_id) {
      return res.status(400).json({ success: false, error: 'Source and target households must be different' })
    }

    const source = await Household.findById(source_household_id)
    const target = await Household.findById(target_household_id)

    if (!source || !target) {
      return res.status(404).json({ success: false, error: 'One or both households not found' })
    }

    // Move people
    const peopleResult = await pool.query(
      'UPDATE people SET household_id = $1, updated_at = CURRENT_TIMESTAMP WHERE household_id = $2 RETURNING id',
      [target_household_id, source_household_id]
    )
    const peopleMoved = peopleResult.rowCount

    // Update gifts
    const giftsResult = await pool.query(
      `UPDATE gifts SET 
        giver_household_id = CASE WHEN giver_household_id = $2 THEN $1 ELSE giver_household_id END,
        receiver_household_id = CASE WHEN receiver_household_id = $2 THEN $1 ELSE receiver_household_id END,
        updated_at = CURRENT_TIMESTAMP
       WHERE giver_household_id = $2 OR receiver_household_id = $2`,
      [target_household_id, source_household_id]
    )
    const giftsUpdated = giftsResult.rowCount

    // Update cards
    const cardsResult = await pool.query(
      'UPDATE cards SET household_id = $1, updated_at = CURRENT_TIMESTAMP WHERE household_id = $2 RETURNING id',
      [target_household_id, source_household_id]
    )
    const cardsUpdated = cardsResult.rowCount

    // Soft delete source household
    await Household.softDelete(source_household_id)

    res.json({
      success: true,
      data: {
        people_moved: peopleMoved,
        gifts_updated: giftsUpdated,
        cards_updated: cardsUpdated
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
