import express from 'express'
import {
  getAllGifts,
  getGiftById,
  createGift,
  updateGift,
  deleteGift
} from '../controllers/giftsController.js'
import { authenticateApiKey } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authenticateApiKey, getAllGifts)
router.get('/:id', authenticateApiKey, getGiftById)
router.post('/', authenticateApiKey, createGift)
router.patch('/:id', authenticateApiKey, updateGift)
router.delete('/:id', authenticateApiKey, deleteGift)

export default router
