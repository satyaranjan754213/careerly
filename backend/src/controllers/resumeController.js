const fs = require("fs/promises");
const path = require("path");
const Resume = require("../models/Resume");
const asyncHandler = require("../utils/asyncHandler");
const extractResumeText = require("../services/resumeParser");

const listResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id }).select("-extractedText").sort({ createdAt: -1 });
  res.json(resumes);
});

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Choose a PDF or DOCX file to upload.");
  }

  try {
    const extractedText = await extractResumeText(req.file.path, req.file.mimetype);
    const resume = await Resume.create({
      user: req.user._id,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      extractedText
    });
    res.status(201).json(resume);
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    throw error;
  }
});

const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) {
    res.status(404);
    throw new Error("Resume not found.");
  }
  await fs.unlink(path.join(__dirname, "../../uploads", resume.storedName)).catch(() => {});
  await resume.deleteOne();
  res.json({ message: "Resume deleted successfully." });
});

const downloadResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) {
    res.status(404);
    throw new Error("Resume not found.");
  }
  const filePath = path.join(__dirname, "../../uploads", resume.storedName);
  res.download(filePath, resume.originalName);
});

module.exports = { listResumes, uploadResume, deleteResume, downloadResume };
