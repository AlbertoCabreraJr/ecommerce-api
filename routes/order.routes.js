const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authenticate = require('../middleware/authenticate');

router.post('/checkout', authenticate, orderController.checkout);
router.get('/', authenticate, orderController.getOrders);
router.get('/:order_id', authenticate, orderController.getOrder);
router.post('/webhook', orderController.handleStripeWebhook);

module.exports = router;