const responseCodes = require('../constants/response-codes')
const cartModel = require('../models/cart.model')

const getCart = async (req, res) => {
  try {
    const { user_id } = req.user

    let cart = await cartModel.getCartByUserId({ user_id })
    if (!cart) {
      cart = await cartModel.createCart({ user_id })
    }

    const cartItems = await cartModel.getCartItems({ cart_id: cart.cart_id })

    return res.status(responseCodes.OK.status).json({ cart, cartItems })
  } catch (error) {
    console.error(error)
    return res.status(responseCodes.INTERNAL_SERVER_ERROR.status).json({ code: responseCodes.INTERNAL_SERVER_ERROR.code })
  }
}

const addItemToCart = async (req, res) => {
  try {
    const { user_id } = req.user
    const { product_id, quantity = 1 } = req.body

    let cart = await cartModel.getCartByUserId({ user_id })
    if (!cart) {
      cart = await cartModel.createCart({ user_id })
    }

    const cartItem = await cartModel.addOrUpdateCartItem({ cart_id: cart.cart_id, product_id, quantity })

    return res.status(responseCodes.OK.status).json({ cartItem })
  } catch (error) {
    console.error(error)
    return res.status(responseCodes.INTERNAL_SERVER_ERROR.status).json({ code: responseCodes.INTERNAL_SERVER_ERROR.code })
  }
}

const removeItemFromCart = async (req, res) => {
  try {
    const { user_id } = req.user
    const { product_id } = req.body

    const cart = await cartModel.getCartByUserId({ user_id })
    if (!cart) {
      return res.status(responseCodes.NOT_FOUND.status).json({ code: responseCodes.NOT_FOUND.code })
    }

    const removed = await cartModel.removeCartItem({ cart_id: cart.cart_id, product_id })
    return res.status(responseCodes.OK.status).json({ removed })
  } catch (error) {
    console.error(error)
    return res.status(responseCodes.INTERNAL_SERVER_ERROR.status).json({ code: responseCodes.INTERNAL_SERVER_ERROR.code })
  }
}

const updateItemQuantity = async (req, res) => {
  try {
    const { user_id } = req.user
    const { product_id, quantity } = req.body

    const cart = await cartModel.getCartByUserId({ user_id })
    if (!cart) {
      return res.status(responseCodes.NOT_FOUND.status).json({ code: responseCodes.NOT_FOUND.code })
    }

    const updated = await cartModel.updateCartItemQuantity({ cart_id: cart.cart_id, product_id, quantity })
    return res.status(responseCodes.OK.status).json({ updated })
  } catch (error) {
    console.error(error)
    return res.status(responseCodes.INTERNAL_SERVER_ERROR.status).json({ code: responseCodes.INTERNAL_SERVER_ERROR.code })
  }
}

module.exports = {
  getCart,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity
}