const { db } = require('../config/db');

const createUser = async ({ name, email, password, is_admin = false }) => {
  const query = `
    INSERT INTO users (name, email, password, is_admin, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING *
  `
  const values = [name, email, password, is_admin]

  const result = await db.query(query, values)
  return result.rows[0]
}

const getUserByEmail = async ({ email }) => {
  const query = `SELECT * FROM users WHERE email = $1`
  const values = [email]

  const result = await db.query(query, values)
  return result.rows[0]
}

const getUserById = async ({ user_id }) => {
  const query = `SELECT * FROM users WHERE user_id = $1`
  const values = [user_id]

  const result = await db.query(query, values)
  return result.rows[0]
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById
}