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

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.ENVIRONMENT === "production",
      sameSite: "Strict",
      path: "/"
    })

    return res.status(responseCodes.CREATED.status).json({ accessToken })
  } catch (error) {
    console.error(error);
    return res.status(responseCodes.INTERNAL_SERVER_ERROR.status).json({ code: responseCodes.INTERNAL_SERVER_ERROR.code })
  }
}

module.exports = {
  signup
}