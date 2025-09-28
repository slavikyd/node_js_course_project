const express = require("express");
const { verify } = require("jsonwebtoken");
const User = require("../models/User");

const {
  createAccessToken,
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken,
} = require("../utils/tokens");

const router = express.Router();

// ---------- SIGNUP ----------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, description } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists! Try logging in.",
        type: "warning",
      });
    }

    const newUser = new User({ name, email, password, description });
    await newUser.save();

    res.status(201).json({
      message: "User created successfully!",
      type: "success",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: "Error creating user",
      type: "error",
    });
  }
});

// ---------- SIGNIN ----------
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found", type: "error" });

    const isMatch = await user.correctPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Password incorrect", type: "error" });

    const accessToken = createAccessToken(user._id);
    const refreshToken = createRefreshToken(user._id);

    user.refreshtoken = refreshToken;
    await user.save();

    sendRefreshToken(res, refreshToken);

    res.json({
      accesstoken: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        description: user.description,
      },
      message: "Login successful",
      type: "success",
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Error signing in", type: "error" });
  }
});

// ---------- LOGOUT ----------
router.post("/logout", async (req, res) => {
  try {
    const { refreshtoken } = req.cookies;
    if (refreshtoken) {
      const user = await User.findOne({ refreshtoken });
      if (user) {
        user.refreshtoken = null;
        await user.save();
      }
    }
    res.clearCookie("refreshtoken", { path: "/auth/refresh_token" });
    return res.json({ message: "Logged out", type: "success" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Error logging out", type: "error" });
  }
});

// ---------- REFRESH ----------
router.post("/refresh_token", async (req, res) => {
  const { refreshtoken } = req.cookies;
  if (!refreshtoken) return res.status(401).json({ message: "No refresh token", type: "error" });

  let id;
  try {
    id = verify(refreshtoken, process.env.REFRESH_TOKEN_SECRET).id;
  } catch (err) {
    return res.status(401).json({ message: "Invalid refresh token", type: "error" });
  }

  const user = await User.findById(id);
  if (!user || user.refreshtoken !== refreshtoken) {
    return res.status(401).json({ message: "Invalid refresh token", type: "error" });
  }

  const accessToken = createAccessToken(user._id);
  const newRefreshToken = createRefreshToken(user._id);

  user.refreshtoken = newRefreshToken;
  await user.save();

  sendRefreshToken(res, newRefreshToken);
  return res.json({ accessToken, message: "Token refreshed", type: "success" });
});

// ---------- ME ----------
router.get("/me", async (req, res) => {
  try {
    const authorization = req.headers["authorization"];
    if (!authorization) return res.status(401).json({ message: "No token", type: "error" });

    const token = authorization.split(" ")[1];
    const { id } = verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(id);
    if (!user) return res.status(401).json({ message: "User not found", type: "error" });

    res.json({
      message: "You are logged in",
      user: { id: user._id, name: user.name, email: user.email, description: user.description },
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid token", type: "error" });
  }
});

module.exports = router;
