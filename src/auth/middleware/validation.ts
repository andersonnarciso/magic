import { Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'

// Validação de CPF
const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]/g, '')
  
  if (cpf.length !== 11) return false
  
  if (/^(\d)\1{10}$/.test(cpf)) return false
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit > 9) digit = 0
  if (digit !== parseInt(cpf.charAt(9))) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit > 9) digit = 0
  if (digit !== parseInt(cpf.charAt(10))) return false
  
  return true
}

// Validação de CEP
const validateCEP = (cep: string): boolean => {
  return /^\d{8}$/.test(cep.replace(/[^\d]/g, ''))
}

// Middleware de validação para registro
export const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Nome deve ter pelo menos 3 caracteres'),
  
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Senhas não conferem')
      }
      return true
    }),
  
  body('cpf')
    .custom((value) => {
      if (!validateCPF(value)) {
        throw new Error('CPF inválido')
      }
      return true
    }),
  
  body('birthDate')
    .isISO8601()
    .withMessage('Data de nascimento inválida')
    .toDate(),
  
  body('cep')
    .custom((value) => {
      if (!validateCEP(value)) {
        throw new Error('CEP inválido')
      }
      return true
    }),
  
  body('state')
    .isLength({ min: 2, max: 2 })
    .withMessage('Estado deve ter 2 caracteres')
    .isUppercase()
    .withMessage('Estado deve estar em maiúsculas'),
  
  body('city')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Cidade deve ter pelo menos 2 caracteres'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  }
]

// Middleware de validação para login
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  }
]
