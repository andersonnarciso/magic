import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { authRoutes } from './routes/index.js'

const app = express()
const port = process.env.AUTH_PORT || 3001

// Middlewares
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Rotas
app.use('/auth', authRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(port, () => {
  console.log(`Servidor de autenticação rodando na porta ${port}`)
})
