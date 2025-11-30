import { Gift } from '../models/Gift.js'

export const getAllGifts = async (req, res) => {
  try {
    const { direction, event_id, household_id, giver_household_id, receiver_household_id } = req.query
    const filters = {}
    if (direction) filters.direction = direction
    if (event_id) filters.event_id = parseInt(event_id)
    if (household_id) filters.household_id = parseInt(household_id)
    if (giver_household_id) filters.giver_household_id = parseInt(giver_household_id)
    if (receiver_household_id) filters.receiver_household_id = parseInt(receiver_household_id)
    
    const gifts = await Gift.findAll(filters)
    res.json({ success: true, data: gifts })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const getGiftById = async (req, res) => {
  try {
    const gift = await Gift.findById(parseInt(req.params.id))
    if (!gift) {
      return res.status(404).json({ success: false, error: 'Gift not found' })
    }
    res.json({ success: true, data: gift })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const createGift = async (req, res) => {
  try {
    const {
      direction,
      event_id,
      giver_person_id,
      giver_household_id,
      receiver_person_id,
      receiver_household_id,
      description,
      est_value,
      given_date,
      notes,
      recorded_by,
      visibility_hint,
      thank_you_sent
    } = req.body
    
    if (!direction || !description) {
      return res.status(400).json({ success: false, error: 'direction and description are required' })
    }

    if (direction !== 'in' && direction !== 'out') {
      return res.status(400).json({ success: false, error: 'direction must be "in" or "out"' })
    }

    const gift = await Gift.create({
      direction,
      event_id: event_id ? parseInt(event_id) : null,
      giver_person_id: giver_person_id ? parseInt(giver_person_id) : null,
      giver_household_id: giver_household_id ? parseInt(giver_household_id) : null,
      receiver_person_id: receiver_person_id ? parseInt(receiver_person_id) : null,
      receiver_household_id: receiver_household_id ? parseInt(receiver_household_id) : null,
      description,
      est_value: est_value ? parseFloat(est_value) : null,
      given_date,
      notes,
      recorded_by: recorded_by || 'me',
      visibility_hint: visibility_hint || 'public',
      thank_you_sent: thank_you_sent || false
    })
    
    res.status(201).json({ success: true, data: gift })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const updateGift = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const gift = await Gift.findById(id)
    
    if (!gift) {
      return res.status(404).json({ success: false, error: 'Gift not found' })
    }

    // Handle numeric conversions for update
    const updateData = { ...req.body }
    if (updateData.event_id !== undefined) updateData.event_id = updateData.event_id ? parseInt(updateData.event_id) : null
    if (updateData.giver_person_id !== undefined) updateData.giver_person_id = updateData.giver_person_id ? parseInt(updateData.giver_person_id) : null
    if (updateData.giver_household_id !== undefined) updateData.giver_household_id = updateData.giver_household_id ? parseInt(updateData.giver_household_id) : null
    if (updateData.receiver_person_id !== undefined) updateData.receiver_person_id = updateData.receiver_person_id ? parseInt(updateData.receiver_person_id) : null
    if (updateData.receiver_household_id !== undefined) updateData.receiver_household_id = updateData.receiver_household_id ? parseInt(updateData.receiver_household_id) : null
    if (updateData.est_value !== undefined) updateData.est_value = updateData.est_value ? parseFloat(updateData.est_value) : null

    const updated = await Gift.update(id, updateData)
    res.json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const deleteGift = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const gift = await Gift.findById(id)
    
    if (!gift) {
      return res.status(404).json({ success: false, error: 'Gift not found' })
    }

    await Gift.delete(id)
    res.json({ success: true, message: 'Gift deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
