const express = require('express');
const controller = require('../controllers/product.controller');
const authenticate = require('../middleware/authenticate');
const validateBody = require('../middleware/validate-body');
const { createProductSchema } = require('../validators/product-schemas');

const router = express.Router();

router.post('/', authenticate, validateBody({ schema: createProductSchema }) , controller.createProduct);
router.get('/', authenticate, controller.getProducts);

module.exports = router;