const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const responseCodes = require('../constants/response-codes');
const orderModel = require('../models/order.model');
const cartModel = require('../models/cart.model');
const productModel = require('../models/product.model');

const checkout = async (req, res) => {
  try {
    const { user_id } = req.user;

    // Get user's cart and items
    const cart = await cartModel.getCartByUserId({ user_id });
    if (!cart) {
      return res.status(responseCodes.NOT_FOUND.status).json({ code: responseCodes.NOT_FOUND.code });
    }

    const cartItems = await cartModel.getCartItems({ cart_id: cart.cart_id });
    if (!cartItems.length) {
      console.error("Empty cart")
      return res.status(responseCodes.BAD_REQUEST.status).json({ code: responseCodes.BAD_REQUEST.code });
    }

    // Prepare Stripe line items and calculate total
    let total_amount = 0;
    const line_items = cartItems.map(item => {
      total_amount += Number(item.price) * item.quantity;
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image_url ? [item.image_url] : [],
          },
          unit_amount: Math.round(Number(item.price) * 100), // Stripe wants cents
        },
        quantity: item.quantity,
      };
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: process.env.FRONTEND_URL + '/order-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: process.env.FRONTEND_URL + '/cart',
      metadata: { user_id: String(user_id) },
    });

    // Create a pending order
    const order = await orderModel.createOrder({
      user_id,
      total_amount,
      stripe_session_id: session.id,
    });

    // Add order_items (but do NOT decrease stock yet; only on payment success)
    await orderModel.addOrderItems({
      order_id: order.order_id,
      items: cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.price,
      })),
    });

    // Respond with Stripe session URL
    return res.status(responseCodes.OK.status).json({ url: session.url });
  } catch (error) {
    console.error(error);
    return res.status(responseCodes.INTERNAL_SERVER_ERROR.status).json({ code: responseCodes.INTERNAL_SERVER_ERROR.code });
  }
};

const handleCheckoutSessionCompleted = async (event) => {
  const session = event.data.object;

  // 1. Mark order as paid
  await orderModel.updateOrderStatus({
    stripe_session_id: session.id,
    status: 'paid',
  });

  // 2. Decrease stock in products table
  const orderRecord = await orderModel.getOrderByStripeSession({ stripe_session_id: session.id });

  if (!orderRecord) {
    return;
  }

  const orderItems = await orderModel.getOrderItems({ order_id: orderRecord.order_id });

  for (const item of orderItems) {
    await productModel.decreaseStock({
      product_id: item.product_id,
      quantity: item.quantity,
    });
  }

  // 3. Empty the user's cart
  const cart = await cartModel.getCartByUserId({ user_id: orderRecord.user_id });
  if (cart) {
    for (const item of orderItems) {
      await cartModel.removeCartItem({ cart_id: cart.cart_id, product_id: item.product_id });
    }
  }
}

const handleCheckoutSessionFailed = async (event) => {
  const session = event.data.object;
  await orderModel.updateOrderStatus({
    stripe_session_id: session.id,
    status: 'failed',
  });
}

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error(error);
    return res.sendStatus(responseCodes.BAD_REQUEST.status);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': 
        await handleCheckoutSessionCompleted(event);
        break;
      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed':
        await handleCheckoutSessionFailed(event);
        break;
      default:
        return res.sendStatus(responseCodes.OK.status);
    }
    res.sendStatus(responseCodes.OK.status);
  } catch (error) {
    console.error(error);
    res.sendStatus(responseCodes.INTERNAL_SERVER_ERROR.status);
  }
};

const getOrders = async (req, res) => {
  try {
    const { user_id } = req.user;
    const orders = await orderModel.getOrdersByUserId({ user_id });

    // Attach items to each order
    for (let order of orders) {
      order.items = await orderModel.getOrderItems({ order_id: order.order_id });
    }

    return res.status(responseCodes.OK.status).json({ orders });
  } catch (error) {
    console.error(error);
    return res.status(responseCodes.INTERNAL_SERVER_ERROR.status).json({ code: responseCodes.INTERNAL_SERVER_ERROR.code });
  }
};

const getOrder = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { order_id } = req.params;

    const orders = await orderModel.getOrdersByUserId({ user_id });
    const order = orders.find(o => o.order_id === Number(order_id));
    if (!order) return res.status(responseCodes.NOT_FOUND.status).json({ code: responseCodes.NOT_FOUND.code });

    order.items = await orderModel.getOrderItems({ order_id: order.order_id });

    return res.status(responseCodes.OK.status).json({ order });
  } catch (error) {
    console.error(error);
    return res.status(responseCodes.INTERNAL_SERVER_ERROR.status).json({ code: responseCodes.INTERNAL_SERVER_ERROR.code });
  }
};

module.exports = {
  checkout,
  handleStripeWebhook,
  getOrders,
  getOrder,
};