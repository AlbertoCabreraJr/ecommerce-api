const { db } = require('../config/db');

const createOrder = async ({ user_id, total_amount, stripe_session_id }) => {
  const query = `
    INSERT INTO orders (user_id, total_amount, stripe_session_id)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [user_id, total_amount, stripe_session_id];

  const result = await db.query(query, values);
  return result.rows[0];
};

const addOrderItems = async ({ order_id, items }) => {
  const values = [];
  const params = [];

  items.forEach((item, index) => {
    // Each item gets its own set of 4 params
    const offset = index * 4;
    params.push(
      `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`
    );
    // Push order_id and item fields for each item
    values.push(order_id, item.product_id, item.quantity, item.price_at_purchase);
  });

  const query = `
    INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
    VALUES ${params.join(',')}
    RETURNING *
  `;

  const result = await db.query(query, values);
  return result.rows;
};

// Update order status (for webhook/callback)
// 'pending', 'paid', 'failed', 'cancelled', 'refunded'
const updateOrderStatus = async ({ stripe_session_id, status }) => {
  const query = `
    UPDATE orders
    SET status = $1, updated_at = NOW()
    WHERE stripe_session_id = $2
    RETURNING *
  `;
  const values = [status, stripe_session_id];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getOrderByStripeSession = async ({ stripe_session_id }) => {
  const query = `SELECT * FROM orders WHERE stripe_session_id = $1 LIMIT 1`;
  const values = [stripe_session_id];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getOrdersByUserId = async ({ user_id }) => {
  const query = `
    SELECT * FROM orders
    WHERE user_id = $1 AND is_deleted = FALSE
    ORDER BY created_at DESC
  `;
  const values = [user_id];
  const result = await db.query(query, values);
  return result.rows;
};

const getOrderItems = async ({ order_id }) => {
  const query = `
    SELECT oi.*, p.name, p.image_url
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    WHERE oi.order_id = $1 AND oi.is_deleted = FALSE
  `;
  const values = [order_id];
  const result = await db.query(query, values);
  return result.rows;
};

module.exports = {
  createOrder,
  addOrderItems,
  updateOrderStatus,
  getOrderByStripeSession,
  getOrdersByUserId,
  getOrderItems,
};