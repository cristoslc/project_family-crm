import express from 'express'
import {
  getAllPeople,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson
} from '../controllers/peopleController.js'
import { authenticateApiKey } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authenticateApiKey, getAllPeople)
router.get('/:id', authenticateApiKey, getPersonById)
router.post('/', authenticateApiKey, createPerson)
router.patch('/:id', authenticateApiKey, updatePerson)
router.delete('/:id', authenticateApiKey, deletePerson)

export default router
