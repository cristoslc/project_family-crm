import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import healthRoutes from './routes/health.js'
import { initDatabase } from './db/initDb.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Initialize database on startup
initDatabase().catch(err => {
  console.error('Failed to initialize database:', err)
  process.exit(1)
})

// API routes
app.use('/api', healthRoutes)

// Serve static files from React build (in production)
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '../public')
  app.use(express.static(publicPath))
  
  // Catch all handler: send back React's index.html file for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'))
  })
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
