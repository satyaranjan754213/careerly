const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  resume: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  score: { type: Number, default: 0 },
  atsScore: { type: Number, default: 0 },
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  resumeSkills: [{ type: String }],
  requiredSkills: [{ type: String }],
  suggestions: [{ type: String }],
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  recommendations: [{ type: String }],
  careerRoles: [{ type: String }],
  interviewQuestions: [{ type: String }],
  summary: { type: String, default: "" },
  aiProvider: { type: String, default: "gemini" }
}, { timestamps: true });

module.exports = mongoose.model("Assessment", assessmentSchema);
