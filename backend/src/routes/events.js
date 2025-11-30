import express from 'express'
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controllers/eventsController.js'
import { authenticateApiKey } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authenticateApiKey, getAllEvents)
router.get('/:id', authenticateApiKey, getEventById)
router.post('/', authenticateApiKey, createEvent)
router.patch('/:id', authenticateApiKey, updateEvent)
router.delete('/:id', authenticateApiKey, deleteEvent)

export default router
