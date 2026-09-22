import dotenv from 'dotenv'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectDatabase } from './config/db.js'
import resourceRoutes from './routes/resourceRoutes.js'

// Resolve relative to this file (not process.cwd()) so the server finds the root .env regardless of the directory it was launched from.
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.resolve(rootDir, '.env'), override: false })

const app = express()
const port = Number(process.env.PORT || 5000)
let server

app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()) : true }))
app.use(express.json({ limit: '1mb' }))
app.get('/api/health', (req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'unavailable' }))
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next()
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'MongoDB is unavailable. Configure MONGO_URI and start MongoDB.' })
  return next()
})
app.use('/api', resourceRoutes)
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error)
  const status = error.name === 'ValidationError' || error.name === 'CastError' ? 400 : error.code === 11000 ? 409 : 500
  const message = error.code === 11000 ? 'A record with this identifier already exists.' : error.message || 'Unexpected server error'
  res.status(status).json({ message })
})

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(port, () => console.log(`PETROGEL API listening on http://localhost:${port}`))
  connectDatabase().catch((error) => console.error(`MongoDB Atlas connection failed: ${error.message}`))
}

async function shutdown(signal) {
  console.log(`${signal} received; shutting down PETROGEL API.`)
  if (server) await new Promise((resolve) => server.close(resolve))
  await mongoose.connection.close(false)
  process.exit(0)
}

process.once('SIGINT', () => shutdown('SIGINT'))
process.once('SIGTERM', () => shutdown('SIGTERM'))

export default app
