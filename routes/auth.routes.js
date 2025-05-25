const express = require('express');
const authController = require('../controllers/auth.controller');
const validateBody = require('../middleware/validate-body');
const { signupSchema, loginSchema } = require('../validators/auth-schemas');

const router = express.Router();

router.post("/signup", validateBody({ schema: signupSchema }) , authController.signup);
router.post("/login", validateBody({ schema: loginSchema }) , authController.login);

module.exports = router;