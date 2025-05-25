const express = require('express');
const controller = require('../controllers/product.controller');

const router = express.Router();

router.post('/', controller.createProduct);
router.get('/', controller.getProducts);

module.exports = router;