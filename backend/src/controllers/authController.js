const User = require("../models/User");
const Role = require("../models/Role");
const Permission = require("../models/Permission");

const { generateToken } = require("../utils/jwt");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ---------------------------------------
    // Validate request
    // ---------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // ---------------------------------------
    // Find user
    // ---------------------------------------

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    })
      .select("+password")
      .populate({
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
        message: "Invalid email or password",
      });
    }

    // ---------------------------------------
    // Check role
    // ---------------------------------------

    if (!user.role) {
      return res.status(500).json({
        success: false,
        message: "User role is not configured",
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
    // Check password
    // ---------------------------------------

    const isPasswordCorrect =
      await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ---------------------------------------
    // Update last login
    // ---------------------------------------

    await User.findByIdAndUpdate(
      user._id,
      {
        lastLogin: new Date(),
      },
      {
        returnDocument: "after",
      }
    );

    // ---------------------------------------
    // Generate JWT
    // ---------------------------------------

    const token = generateToken(
      user._id.toString()
    );

    // ---------------------------------------
    // Permissions
    // ---------------------------------------

    const permissions =
      user.role.permissions?.map(
        (permission) => permission.name
      ) || [];

    // ---------------------------------------
    // Response
    // ---------------------------------------

    return res.status(200).json({
      success: true,

      message: "Login successful",

      data: {
        token,

        user: {
          id: user._id,

          firstName: user.firstName,

          lastName: user.lastName,

          email: user.email,

          role: user.role.name,

          permissions,
        },
      },
    });
  } catch (error) {
    console.error("========== LOGIN ERROR ==========");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ---------------------------------------
// Get current logged-in user
// ---------------------------------------

const getMe = async (req, res) => {
  try {
    const permissions =
      req.user.role?.permissions?.map(
        (permission) => permission.name
      ) || [];

    return res.status(200).json({
      success: true,

      data: {
        id: req.user._id,

        firstName:
          req.user.firstName,

        lastName:
          req.user.lastName,

        email:
          req.user.email,

        role:
          req.user.role?.name,

        permissions,
      },
    });
  } catch (error) {
    console.error(
      "GET ME ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  login,
  getMe,
};