import pool from '../db/connection.js'

export const Card = {
  async findAll(filters = {}) {
    const { event_id, status } = filters
    let query = 'SELECT * FROM cards WHERE 1=1'
    const params = []
    let paramCount = 0

    if (event_id) {
      paramCount++
      query += ` AND event_id = $${paramCount}`
      params.push(event_id)
    }

    if (status) {
      paramCount++
      query += ` AND status = $${paramCount}`
      params.push(status)
    }

    query += ' ORDER BY created_at DESC'
    const result = await pool.query(query, params.length > 0 ? params : undefined)
    return result.rows
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM cards WHERE id = $1', [id])
    return result.rows[0]
  },

  async create(data) {
    const { event_id, household_id, address_name, status = 'planned', notes } = data

    const result = await pool.query(
      `INSERT INTO cards (event_id, household_id, address_name, status, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [event_id, household_id, address_name || null, status, notes || null]
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
      `UPDATE cards SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    )
    return result.rows[0]
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM cards WHERE id = $1 RETURNING *', [id])
    return result.rows[0]
  }
}
