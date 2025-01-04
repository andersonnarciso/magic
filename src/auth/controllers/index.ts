import { Request, Response } from 'express'
import { prisma } from '../../lib/prisma.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Registrar usuário
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, cpf, birthDate, cep, state, city } = req.body

    // Verifica se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' })
    }

    // Verifica se o CPF já existe
    const existingCPF = await prisma.user.findUnique({
      where: { cpf }
    })

    if (existingCPF) {
      return res.status(400).json({ error: 'CPF já cadastrado' })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        cpf,
        birthDate,
        cep,
        state,
        city
      }
    })

    // Remove a senha do objeto de retorno
    const { password: _, ...userWithoutPassword } = user

    // Gera o token JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        isAdmin: user.isAdmin
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Salva o token no Redis
    await redis.set(`auth:${user.id}`, token, 'EX', 24 * 60 * 60)

    res.status(201).json({
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Error registering user:', error)
    res.status(500).json({ error: 'Erro ao registrar usuário' })
  }
}

// Login
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    // Verifica a senha
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    // Remove a senha do objeto de retorno
    const { password: _, ...userWithoutPassword } = user

    // Gera o token JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        isAdmin: user.isAdmin
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Salva o token no Redis
    await redis.set(`auth:${user.id}`, token, 'EX', 24 * 60 * 60)

    res.json({
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Error logging in:', error)
    res.status(500).json({ error: 'Erro ao fazer login' })
  }
}

// Validar token
export const validateToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    // Verifica o token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    // Verifica se o token está no Redis
    const storedToken = await redis.get(`auth:${decoded.userId}`)
    if (!storedToken || storedToken !== token) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' })
    }

    // Remove a senha do objeto de retorno
    const { password: _, ...userWithoutPassword } = user

    res.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Error validating token:', error)
    res.status(401).json({ error: 'Token inválido' })
  }
}
