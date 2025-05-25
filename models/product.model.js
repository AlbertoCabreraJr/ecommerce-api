const { db } = require('../config/db')

const createProduct = async ({ name, description, price, stock, image_url }) => {
  const query = `
    INSERT INTO products (name, description, price, stock, image_url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `
  const values = [name, description, price, stock, image_url]

  const result = await db.query(query, values)

  return result.rows[0]
}

const getProducts = async ({ page = 1, limit = 10 }) => {
  page = Math.max(1, parseInt(page, 10) || 1);
  limit = Math.max(1, parseInt(limit, 10) || 10);
  const offset = (page - 1) * limit;

  const query = `
    SELECT *, COUNT(*) OVER() AS total
    FROM products
    WHERE is_deleted = FALSE
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `
  const values = [limit, offset]

  const result = await db.query(query, values)

  return result.rows
}

module.exports = {
  createProduct,
  getProducts
}