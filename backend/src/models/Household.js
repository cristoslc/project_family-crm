import pool from '../db/connection.js'

export const Household = {
  async findAll(filters = {}) {
    const { active = true } = filters
    const result = await pool.query(
      'SELECT * FROM households WHERE active = $1 ORDER BY name ASC',
      [active]
    )
    return result.rows
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM households WHERE id = $1', [id])
    return result.rows[0]
  },

  async findByIdWithMembers(id) {
    const household = await this.findById(id)
    if (!household) return null

    const membersResult = await pool.query(
      'SELECT * FROM people WHERE household_id = $1 AND active = true ORDER BY display_name ASC',
      [id]
    )
    household.members = membersResult.rows
    return household
  },

  async create(data) {
    const {
      name,
      address_line_1,
      address_line_2,
      city,
      region,
      postal_code,
      country,
      card_greeting_name,
      notes
    } = data

    const result = await pool.query(
      `INSERT INTO households (name, address_line_1, address_line_2, city, region, postal_code, country, card_greeting_name, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        name,
        address_line_1 || null,
        address_line_2 || null,
        city || null,
        region || null,
        postal_code || null,
        country || null,
        card_greeting_name || null,
        notes || null
      ]
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
      `UPDATE households SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    )
    return result.rows[0]
  },

  async softDelete(id) {
    const result = await pool.query(
      'UPDATE households SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    )
    return result.rows[0]
  }
}
