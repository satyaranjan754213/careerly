const asyncHandler = require("../utils/asyncHandler");

const getProfile = asyncHandler(async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    headline: req.user.headline,
    location: req.user.location
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, headline, location } = req.body;
  if (name !== undefined) req.user.name = name.trim();
  if (headline !== undefined) req.user.headline = headline;
  if (location !== undefined) req.user.location = location;
  await req.user.save();

  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    headline: req.user.headline,
    location: req.user.location
  });
});

module.exports = { getProfile, updateProfile };
