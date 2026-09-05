const express = require("express");

const {
  login,
  getMe,
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticate a Supervision admin user.
 *     tags:
 *       - Authentication
 *
 *     requestBody:
 *       required: true
 *
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *
 *     responses:
 *       200:
 *         description: Login successful
 *
 *       400:
 *         description: Email and password are required
 *
 *       401:
 *         description: Invalid email or password
 *
 *       403:
 *         description: Account is not active
 */
router.post(
  "/login",
  login
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current admin
 *     description: Get the currently authenticated Supervision user.
 *     tags:
 *       - Authentication
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Current user information
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: Account is not active
 */
router.get(
  "/me",
  protect,
  getMe
);

module.exports = router;