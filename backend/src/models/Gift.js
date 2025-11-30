import pool from '../db/connection.js'

export const Gift = {
  async findAll(filters = {}) {
    const { direction, event_id, household_id, giver_household_id, receiver_household_id } = filters
    let query = 'SELECT * FROM gifts WHERE 1=1'
    const params = []
    let paramCount = 0

    if (direction) {
      paramCount++
      query += ` AND direction = $${paramCount}`
      params.push(direction)
    }

    if (event_id) {
      paramCount++
      query += ` AND event_id = $${paramCount}`
      params.push(event_id)
    }

    if (household_id) {
      paramCount++
      query += ` AND (giver_household_id = $${paramCount} OR receiver_household_id = $${paramCount})`
      params.push(household_id)
    }

    if (giver_household_id) {
      paramCount++
      query += ` AND giver_household_id = $${paramCount}`
      params.push(giver_household_id)
    }

    if (receiver_household_id) {
      paramCount++
      query += ` AND receiver_household_id = $${paramCount}`
      params.push(receiver_household_id)
    }

    query += ' ORDER BY given_date DESC NULLS LAST, created_at DESC'
    const result = await pool.query(query, params.length > 0 ? params : undefined)
    return result.rows
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM gifts WHERE id = $1', [id])
    return result.rows[0]
  },

  async create(data) {
    const {
      direction,
      event_id,
      giver_person_id,
      giver_household_id,
      receiver_person_id,
      receiver_household_id,
      description,
      est_value,
      given_date,
      notes,
      recorded_by = 'me',
      visibility_hint = 'public',
      thank_you_sent = false
    } = data

    const result = await pool.query(
      `INSERT INTO gifts (direction, event_id, giver_person_id, giver_household_id, receiver_person_id, receiver_household_id, description, est_value, given_date, notes, recorded_by, visibility_hint, thank_you_sent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        direction,
        event_id || null,
        giver_person_id || null,
        giver_household_id || null,
        receiver_person_id || null,
        receiver_household_id || null,
        description,
        est_value || null,
        given_date || null,
        notes || null,
        recorded_by,
        visibility_hint,
        thank_you_sent
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
      `UPDATE gifts SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    )
    return result.rows[0]
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM gifts WHERE id = $1 RETURNING *', [id])
    return result.rows[0]
  }
}
