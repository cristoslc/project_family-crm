import express from 'express'
import {
  getAllHouseholds,
  getHouseholdById,
  createHousehold,
  updateHousehold,
  deleteHousehold,
  mergeHouseholds
} from '../controllers/householdsController.js'
import { authenticateApiKey } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authenticateApiKey, getAllHouseholds)
router.get('/:id', authenticateApiKey, getHouseholdById)
router.post('/', authenticateApiKey, createHousehold)
router.post('/merge', authenticateApiKey, mergeHouseholds)
router.patch('/:id', authenticateApiKey, updateHousehold)
router.delete('/:id', authenticateApiKey, deleteHousehold)

export default router
