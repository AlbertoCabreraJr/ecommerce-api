const { db } = require('../config/db')

const createCart = async ({ user_id}) => {
  const query = `
    INSERT INTO carts (user_id)
    VALUES ($1)
    RETURNING *
  `
  const values = [user_id]

  const result = await db.query(query, values)

  return result.rows[0]
}

const getCartByUserId = async ({ user_id }) => {
  const query = `
    SELECT * FROM carts
    WHERE user_id = $1
    AND is_deleted = FALSE
    ORDER BY created_at DESC
    LIMIT 1
  `
  const values = [user_id]

  const result = await db.query(query, values)

  return result.rows[0]
}

const addOrUpdateCartItem = async ({ cart_id, product_id, quantity }) => {
  const query = `
    INSERT INTO cart_items (cart_id, product_id, quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (cart_id, product_id)
    DO UPDATE SET quantity = $3, is_deleted = FALSE, updated_at = NOW()
    RETURNING *
  `
  const values = [cart_id, product_id, quantity]

  const result = await db.query(query, values)

  return result.rows[0]
}

const getCartItems = async ({ cart_id }) => {
  const query = `
    SELECT ci.*, p.name, p.price, p.image_url, p.description
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.product_id
    WHERE ci.cart_id = $1 AND ci.is_deleted = FALSE
  `
  const values = [cart_id]

  const result = await db.query(query, values)

  return result.rows
}

const removeCartItem = async ({ cart_id, product_id }) => {
  const query = `
    UPDATE cart_items
    SET is_deleted = TRUE, updated_at = NOW()
    WHERE cart_id = $1 AND product_id = $2
    RETURNING *
  `
  const values = [cart_id, product_id]

  const result = await db.query(query, values)

  return result.rows[0]
}

const updateCartItemQuantity = async ({ cart_id, product_id, quantity }) => {
  const query = `
    UPDATE cart_items
    SET quantity = $3, updated_at = NOW()
    WHERE cart_id = $1 AND product_id = $2 AND is_deleted = FALSE
    RETURNING *
  `
  const values = [cart_id, product_id, quantity]

  const result = await db.query(query, values)

  return result.rows[0]
}

module.exports = {
  createCart,
  getCartByUserId,
  addOrUpdateCartItem,
  getCartItems,
  removeCartItem,
  updateCartItemQuantity
}