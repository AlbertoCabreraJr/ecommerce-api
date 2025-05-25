const jwt = require('jsonwebtoken')
const tokenModel = require('../models/refresh-token.model')
const userModel = require('../models/user.model');
const responseCodes = require('../constants/response-codes');
const { generateAccessTokenAndRefreshToken } = require('../services/token.service');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

const authenticate = async (req, res, next) => {
  const accessToken = req.headers.authorization?.split(' ')[1];

  try {
    const decoded = jwt.verify(accessToken, JWT_ACCESS_SECRET);
    req.user = { user_id: decoded.user_id };
    return next();
  } catch (err) {
    console.error(err)
    if (err.name !== 'TokenExpiredError') {
      return res.status(responseCodes.UNAUTHORIZED.status).json({ code: responseCodes.UNAUTHORIZED.code })
    }
  }

  const refreshToken = req.cookies.refreshToken || req.headers['x-refresh-token'];
  if (!refreshToken) {
    return res.status(responseCodes.UNAUTHORIZED.status).json({ code: responseCodes.UNAUTHORIZED.code })
  }

  const refreshTokenRecord = await tokenModel.findRefreshToken(refreshToken);
  if (!refreshTokenRecord || refreshTokenRecord.used) {
    return res.status(responseCodes.FORBIDDEN.status).json({ code: responseCodes.FORBIDDEN.code })
  }

  const user = await userModel.getUserById(refreshTokenRecord.user_id);
  if (!user || user.is_deleted) {
    return res.status(responseCodes.FORBIDDEN.status).json({ code: responseCodes.FORBIDDEN.code })
  }

  await tokenModel.markRefreshTokenUsed(refreshToken);

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateAccessTokenAndRefreshToken({ user });

  res.setHeader('x-access-token', newAccessToken);

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });

  req.user = { user_id: user.user_id };
  next();
};

module.exports = authenticate;