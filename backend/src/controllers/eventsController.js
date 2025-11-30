import { Event } from '../models/Event.js'

export const getAllEvents = async (req, res) => {
  try {
    const { event_type } = req.query
    const filters = {}
    if (event_type) filters.event_type = event_type
    
    const events = await Event.findAll(filters)
    res.json({ success: true, data: events })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const getEventById = async (req, res) => {
  try {
    const includeCounts = req.query.include_counts === 'true'
    const event = includeCounts
      ? await Event.findByIdWithCounts(parseInt(req.params.id))
      : await Event.findById(parseInt(req.params.id))
    
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' })
    }
    res.json({ success: true, data: event })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const createEvent = async (req, res) => {
  try {
    const { name, event_date, event_type, notes } = req.body
    
    if (!name || !event_type) {
      return res.status(400).json({ success: false, error: 'name and event_type are required' })
    }

    const event = await Event.create({
      name,
      event_date,
      event_type,
      notes
    })
    
    res.status(201).json({ success: true, data: event })
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ success: false, error: 'Event with this name already exists' })
    }
    res.status(500).json({ success: false, error: error.message })
  }
}

export const updateEvent = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const event = await Event.findById(id)
    
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' })
    }

    const updated = await Event.update(id, req.body)
    res.json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const deleteEvent = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const event = await Event.findById(id)
    
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' })
    }

    await Event.delete(id)
    res.json({ success: true, message: 'Event deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
