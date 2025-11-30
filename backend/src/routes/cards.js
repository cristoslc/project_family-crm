import express from 'express'
import {
  getAllCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard
} from '../controllers/cardsController.js'
import { authenticateApiKey } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authenticateApiKey, getAllCards)
router.get('/:id', authenticateApiKey, getCardById)
router.post('/', authenticateApiKey, createCard)
router.patch('/:id', authenticateApiKey, updateCard)
router.delete('/:id', authenticateApiKey, deleteCard)

export default router
