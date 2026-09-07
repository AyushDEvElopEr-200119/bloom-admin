const User = require("../models/User");
const Role = require("../models/Role");
const Permission = require("../models/Permission");

const { verifyToken } = require("../utils/jwt");

const protect = async (req, res, next) => {
  try {
    let token;

    // ---------------------------------------
    // Get token from Authorization header
    // ---------------------------------------

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ---------------------------------------
    // Token missing
    // ---------------------------------------

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // ---------------------------------------
    // Verify JWT token
    // ---------------------------------------

    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // ---------------------------------------
    // Find user and populate role + permissions
    // Note: Do NOT select +password to avoid leaking hash
    // ---------------------------------------

    const user = await User.findById(decoded.userId).populate({
      path: "role",
      populate: {
        path: "permissions",
      },
    });

    // ---------------------------------------
    // User not found
    // ---------------------------------------

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // ---------------------------------------
    // Check account status
    // ---------------------------------------

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active",
      });
    }

    // ---------------------------------------
    // Attach authenticated user to request
    // ---------------------------------------

    req.user = user;

    // ---------------------------------------
    // Continue to controller
    // ---------------------------------------

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = {
  protect,
};