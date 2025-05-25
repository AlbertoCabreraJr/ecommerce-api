const express = require('express')
const router = express.Router()
const cartController = require('../controllers/cart.controller')
const authenticate = require('../middleware/authenticate')

router.get('/', authenticate, cartController.getCart)
router.post('/add', authenticate, cartController.addItemToCart)
router.post('/remove', authenticate, cartController.removeItemFromCart)
router.post('/update', authenticate, cartController.updateItemQuantity)

module.exports = router