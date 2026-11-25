const Assessment = require("../models/Assessment");
const Resume = require("../models/Resume");
const Job = require("../models/Job");
const analyzeResumeWithGemini = require("../services/geminiService");
const asyncHandler = require("../utils/asyncHandler");

const listAssessments = asyncHandler(async (req, res) => {
  const assessments = await Assessment.find({ user: req.user._id })
    .populate("resume", "originalName")
    .populate("job", "title company")
    .sort({ createdAt: -1 });
  res.json(assessments);
});

const createAssessment = asyncHandler(async (req, res) => {
  const { resumeId, jobId } = req.body;
  if (!resumeId || !jobId) {
    res.status(400);
    throw new Error("resumeId and jobId are required.");
  }

  const [resume, job] = await Promise.all([
    Resume.findOne({ _id: resumeId, user: req.user._id }),
    Job.findOne({ _id: jobId, user: req.user._id })
  ]);

  if (!resume) {
    res.status(404);
    throw new Error("Resume not found.");
  }
  if (!job) {
    res.status(404);
    throw new Error("Job not found.");
  }
  if (!resume.extractedText || !resume.extractedText.trim()) {
    res.status(422);
    throw new Error("No readable text was extracted from this resume. Try a text-based PDF or DOCX file.");
  }

  const result = await analyzeResumeWithGemini(resume.extractedText, job.description);

  const assessment = await Assessment.create({
    user: req.user._id,
    resume: resume._id,
    job: job._id,
    ...result
  });

  const populated = await Assessment.findById(assessment._id)
    .populate("resume", "originalName")
    .populate("job", "title company");

  res.status(201).json(populated);
});

module.exports = { listAssessments, createAssessment };
