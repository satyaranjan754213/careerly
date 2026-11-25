const bcrypt = require("bcryptjs");
const User = require("../models/User");
const createToken = require("../utils/token");
const asyncHandler = require("../utils/asyncHandler");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required.");
  }
  if (password.length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (await User.findOne({ email: normalizedEmail })) {
    res.status(409);
    throw new Error("An account with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ name: name.trim(), email: normalizedEmail, password: hashedPassword });

  res.status(201).json({
    token: createToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, headline: user.headline, location: user.location }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
  const valid = user && await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401);
    throw new Error("Incorrect email or password.");
  }

  res.json({
    token: createToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, headline: user.headline, location: user.location }
  });
});

module.exports = { register, login };
