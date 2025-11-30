import express from 'express'
import { importGifts, importPeople } from '../controllers/importController.js'
import { authenticateApiKey } from '../middleware/auth.js'

const router = express.Router()

router.post('/gifts', authenticateApiKey, importGifts)
router.post('/people', authenticateApiKey, importPeople)

export default router
