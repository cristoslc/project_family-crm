import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pool from './connection.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function initDatabase() {
  try {
    console.log('Initializing database...')
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '001_initial_schema.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')
    
    // Split SQL into individual statements
    // Remove comments and split by semicolon, but keep multi-line statements intact
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement + ';')
        } catch (error) {
          // Ignore "already exists" errors (table/index already created)
          if (error.code === '42P07' || // duplicate_table
              error.code === '42710' || // duplicate_object
              error.message.includes('already exists')) {
            // Silently skip - table/index already exists
            continue
          } else {
            console.error('Error executing statement:', statement.substring(0, 50) + '...')
            throw error
          }
        }
      }
    }
    
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization error:', error)
    throw error
  }
}
