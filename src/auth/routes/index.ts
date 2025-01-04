import { Router } from 'express'
import { registerUser, loginUser, validateToken } from '../controllers/index.js'
import { validateRegistration, validateLogin } from '../middleware/validation.js'

const router = Router()

// Rotas de autenticação
router.post('/register', validateRegistration, registerUser)
router.post('/login', validateLogin, loginUser)
router.get('/validate', validateToken)

export const authRoutes = router
