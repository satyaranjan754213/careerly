const Job = require("../models/Job");
const asyncHandler = require("../utils/asyncHandler");

const listJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(jobs);
});

const createJob = asyncHandler(async (req, res) => {
  const { title, company, description, location } = req.body;
  if (!title || !description) {
    res.status(400);
    throw new Error("Job title and description are required.");
  }
  const job = await Job.create({
    user: req.user._id,
    title: title.trim(),
    company: company || "",
    description: description.trim(),
    location: location || ""
  });
  res.status(201).json(job);
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!job) {
    res.status(404);
    throw new Error("Job not found.");
  }
  res.json({ message: "Job deleted successfully." });
});

module.exports = { listJobs, createJob, deleteJob };
