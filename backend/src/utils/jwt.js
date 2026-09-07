const jwt = require("jsonwebtoken");

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }
  return secret;
};

const generateToken = (userId) => {
  return jwt.sign(
    {
      userId: userId.toString(),
    },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

module.exports = {
  generateToken,
  verifyToken,
};