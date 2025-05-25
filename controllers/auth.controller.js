const bcrypt = require('bcrypt');
const responseCodes = require('../constants/response-codes');
const userModel = require('../models/user.model');
const { generateAccessTokenAndRefreshToken } = require('../services/token.service');

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await userModel.getUserByEmail({ email });
    if (existingUser) {
      return res.status(responseCodes.EMAIL_ALREADY_EXISTS.status).json({ code: responseCodes.EMAIL_ALREADY_EXISTS.code })
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.createUser({ email, password: hashedPassword, name })
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken({ user })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    return res.status(responseCodes.CREATED.status).json({ accessToken })
  } catch (error) {
    console.error(error);
    return res.status(responseCodes.INTERNAL_SERVER_ERROR.status).json({ code: responseCodes.INTERNAL_SERVER_ERROR.code })
  }
}

const login = async (req, res) => {
  const { email, password } = req.body;

  try { 
    const user = await userModel.getUserByEmail({ email });

    if (!user) {
      return res.status(responseCodes.NOT_FOUND.status).json({ code: responseCodes.NOT_FOUND.code })
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(responseCodes.INVALID_CREDENTIALS.status).json({ code: responseCodes.INVALID_CREDENTIALS.code })
    }
    
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken({ user })
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    return res.status(responseCodes.OK.status).json({ accessToken })
  } catch (error) {
    console.error(error);
    return res.status(responseCodes.INTERNAL_SERVER_ERROR.status).json({ code: responseCodes.INTERNAL_SERVER_ERROR.code })
  }
}

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.headers['x-refresh-token'];
    if (refreshToken) {
      await tokenModel.invalidateTokenFamily(refreshToken)
      res.clearCookie('refreshToken', { path: '/' });
    }

    return res.sendStatus(responseCodes.OK.status)
  } catch (error) {
    console.error(error)
    return res.status(responseCodes.INTERNAL_SERVER_ERROR.status).json({ code: responseCodes.INTERNAL_SERVER_ERROR.code })
  }
}

module.exports = {
  signup,
  login,
  logout
}