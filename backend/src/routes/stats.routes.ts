import { Router } from 'express'
import { getStreak } from '../controllers/stats.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()

router.get('/streak', authMiddleware, getStreak)

export default router