import pool from '../db/connection.js'

export const Event = {
  async findAll(filters = {}) {
    const { event_type } = filters
    let query = 'SELECT * FROM events'
    const params = []

    if (event_type) {
      query += ' WHERE event_type = $1'
      params.push(event_type)
    }

    query += ' ORDER BY event_date DESC NULLS LAST, created_at DESC'
    const result = await pool.query(query, params.length > 0 ? params : undefined)
    return result.rows
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [id])
    return result.rows[0]
  },

  async findByName(name) {
    const result = await pool.query('SELECT * FROM events WHERE name = $1', [name])
    return result.rows[0]
  },

  async findByIdWithCounts(id) {
    const event = await this.findById(id)
    if (!event) return null

    const giftsResult = await pool.query(
      'SELECT COUNT(*) as count FROM gifts WHERE event_id = $1',
      [id]
    )
    const cardsResult = await pool.query(
      'SELECT COUNT(*) as count FROM cards WHERE event_id = $1',
      [id]
    )

    event.gift_count = parseInt(giftsResult.rows[0].count)
    event.card_count = parseInt(cardsResult.rows[0].count)
    return event
  },

  async create(data) {
    const { name, event_date, event_type, notes } = data

    const result = await pool.query(
      `INSERT INTO events (name, event_date, event_type, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, event_date || null, event_type, notes || null]
    )
    return result.rows[0]
  },

  async update(id, data) {
    const fields = []
    const values = []
    let paramCount = 1

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(data[key] === '' ? null : data[key])
        paramCount++
      }
    })

    if (fields.length === 0) {
      return this.findById(id)
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const result = await pool.query(
      `UPDATE events SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    )
    return result.rows[0]
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [id])
    return result.rows[0]
  }
}
