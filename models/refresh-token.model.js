const { db } = require('../config/db');
const bcrypt = require('bcrypt')

const createRefreshToken = async ({ user_id, refreshToken, parentRefreshToken = null }) => {
  const query = `
    INSERT INTO refresh_tokens (user_id, refresh_token, parent_refresh_token, used, created_at)
    VALUES ($1, $2, $3, FALSE, NOW())
    RETURNING *
  `
  const values = [user_id, refreshToken, parentRefreshToken]

  const result = await db.query(query, values)
  return result.rows[0]
}

const findRefreshToken = async ({ refreshToken }) => {
  const query = `
    SELECT * FROM refresh_tokens
    WHERE refresh_token = $1
  `
  const values = [refreshToken]

  const result = await db.query(query, values)
  return result.rows[0]
}

const markRefreshTokenUsed = async ({ refreshToken }) => {
  const query = `
    UPDATE refresh_tokens
    SET used = TRUE
    WHERE refresh_token = $1
  `
  const values = [refreshToken]

  await db.query(query, values)
}

const invalidateRefreshTokenFamily = async ({ refreshToken }) => {
  const query = `
    UPDATE refresh_tokens
    SET used = TRUE
    WHERE refresh_token = $1
    OR parent_refresh_token = (
      SELECT parent_refresh_token FROM refresh_tokens WHERE refresh_token = $1
    )
  `
  const values = [refreshToken]

  await db.query(query, values)
}

module.exports = {
  createRefreshToken,
  findRefreshToken,
  markRefreshTokenUsed,
  invalidateRefreshTokenFamily,
}