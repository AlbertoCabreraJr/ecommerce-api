const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const tokenModel = require('../models/refresh-token.model');
const bcrypt = require('bcrypt');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN

const generateAccessTokenAndRefreshToken = async ({ user, parentRefreshToken = null }) => {
  const accessToken = jwt.sign(
    {
      user_id: user.user_id,
    },
    JWT_ACCESS_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRES_IN }
  );

  const refreshToken = crypto.randomBytes(64).toString('hex') + '.' + Date.now().toString();
  
  await tokenModel.createRefreshToken({ user_id: user.user_id, refreshToken, parentRefreshToken })

  return {
    accessToken,
    refreshToken
  }
}

module.exports = {
  generateAccessTokenAndRefreshToken,
}