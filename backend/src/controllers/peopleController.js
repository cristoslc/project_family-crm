import { Person } from '../models/Person.js'

export const getAllPeople = async (req, res) => {
  try {
    const { household_id, is_child } = req.query
    const filters = {}
    if (household_id) filters.household_id = parseInt(household_id)
    if (is_child !== undefined) filters.is_child = is_child === 'true'
    
    const people = await Person.findAll(filters)
    res.json({ success: true, data: people })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const getPersonById = async (req, res) => {
  try {
    const person = await Person.findById(parseInt(req.params.id))
    if (!person) {
      return res.status(404).json({ success: false, error: 'Person not found' })
    }
    res.json({ success: true, data: person })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const createPerson = async (req, res) => {
  try {
    const { display_name, short_name, household_id, relationship_label, notes, is_child } = req.body
    
    if (!display_name) {
      return res.status(400).json({ success: false, error: 'display_name is required' })
    }

    const person = await Person.create({
      display_name,
      short_name,
      household_id: household_id ? parseInt(household_id) : null,
      relationship_label,
      notes,
      is_child: is_child || false
    })
    
    res.status(201).json({ success: true, data: person })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const updatePerson = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const person = await Person.findById(id)
    
    if (!person) {
      return res.status(404).json({ success: false, error: 'Person not found' })
    }

    const updated = await Person.update(id, req.body)
    res.json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const deletePerson = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const person = await Person.findById(id)
    
    if (!person) {
      return res.status(404).json({ success: false, error: 'Person not found' })
    }

    await Person.softDelete(id)
    res.json({ success: true, message: 'Person deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
