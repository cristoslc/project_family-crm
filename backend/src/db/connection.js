import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'family_crm',
  user: process.env.POSTGRES_USER || 'family_user',
  password: process.env.POSTGRES_PASSWORD || 'family_pass',
  port: process.env.POSTGRES_PORT || 5432
})

// Test connection
pool.on('connect', () => {
  console.log('Database connected')
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

export default pool
