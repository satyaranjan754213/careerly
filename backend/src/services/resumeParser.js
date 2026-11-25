const fs = require("fs/promises");
const path = require("path");

async function extractResumeText(filePath, mimeType) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".pdf" || mimeType === "application/pdf") {
    // pdf-parse v1 returns a function when required.
    const pdfParse = require("pdf-parse");
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text || "";
  }

  if (extension === ".docx") {
    const mammoth = require("mammoth");
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || "";
  }

  throw new Error("Unsupported resume file type.");
}

module.exports = extractResumeText;
