import pool from '../db/connection.js'

export const Person = {
  async findAll(filters = {}) {
    const { household_id, is_child, active = true } = filters
    let query = 'SELECT * FROM people WHERE active = $1'
    const params = [active]
    let paramCount = 1

    if (household_id !== undefined) {
      paramCount++
      query += ` AND household_id = $${paramCount}`
      params.push(household_id)
    }

    if (is_child !== undefined) {
      paramCount++
      query += ` AND is_child = $${paramCount}`
      params.push(is_child)
    }

    query += ' ORDER BY display_name ASC'
    const result = await pool.query(query, params)
    return result.rows
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM people WHERE id = $1', [id])
    return result.rows[0]
  },

  async create(data) {
    const {
      display_name,
      short_name,
      household_id,
      relationship_label,
      notes,
      is_child = false
    } = data

    const result = await pool.query(
      `INSERT INTO people (display_name, short_name, household_id, relationship_label, notes, is_child)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [display_name, short_name || null, household_id || null, relationship_label || null, notes || null, is_child]
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
        values.push(data[key])
        paramCount++
      }
    })

    if (fields.length === 0) {
      return this.findById(id)
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const result = await pool.query(
      `UPDATE people SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    )
    return result.rows[0]
  },

  async softDelete(id) {
    const result = await pool.query(
      'UPDATE people SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    )
    return result.rows[0]
  }
}
