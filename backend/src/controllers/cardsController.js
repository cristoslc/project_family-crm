import { Card } from '../models/Card.js'

export const getAllCards = async (req, res) => {
  try {
    const { event_id, status } = req.query
    const filters = {}
    if (event_id) filters.event_id = parseInt(event_id)
    if (status) filters.status = status
    
    const cards = await Card.findAll(filters)
    res.json({ success: true, data: cards })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const getCardById = async (req, res) => {
  try {
    const card = await Card.findById(parseInt(req.params.id))
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' })
    }
    res.json({ success: true, data: card })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const createCard = async (req, res) => {
  try {
    const { event_id, household_id, address_name, status, notes } = req.body
    
    if (!event_id || !household_id) {
      return res.status(400).json({ success: false, error: 'event_id and household_id are required' })
    }

    const card = await Card.create({
      event_id: parseInt(event_id),
      household_id: parseInt(household_id),
      address_name,
      status: status || 'planned',
      notes
    })
    
    res.status(201).json({ success: true, data: card })
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ success: false, error: 'Card for this event and household already exists' })
    }
    res.status(500).json({ success: false, error: error.message })
  }
}

export const updateCard = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const card = await Card.findById(id)
    
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' })
    }

    const updateData = { ...req.body }
    if (updateData.event_id !== undefined) updateData.event_id = parseInt(updateData.event_id)
    if (updateData.household_id !== undefined) updateData.household_id = parseInt(updateData.household_id)

    const updated = await Card.update(id, updateData)
    res.json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const deleteCard = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const card = await Card.findById(id)
    
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' })
    }

    await Card.delete(id)
    res.json({ success: true, message: 'Card deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
