const express = require('express');
const authController = require('../controllers/auth.controller');
const validateBody = require('../middleware/validate-body');
const { signupSchema } = require('../validators/auth-schemas');

const router = express.Router();

router.post("/signup", validateBody({ schema: signupSchema }) , authController.signup);

module.exports = router;