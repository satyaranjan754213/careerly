const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true },
  company: { type: String, default: "", trim: true },
  description: { type: String, required: true },
  location: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);
