// Lightweight keyword-based assessment. This works locally without an AI API key.
// Extend the list for your target roles or connect an AI provider later.
const SKILLS = [
  "javascript", "typescript", "react", "node.js", "nodejs", "express",
  "mongodb", "mongoose", "sql", "mysql", "postgresql", "python", "java",
  "c++", "html", "css", "tailwind", "redux", "rest api", "graphql",
  "git", "github", "docker", "aws", "azure", "machine learning",
  "data analysis", "excel", "power bi", "figma", "communication",
  "leadership", "problem solving", "project management", "agile",
  "testing", "jest", "cypress", "next.js", "nextjs", "vite"
];

function normalize(text = "") {
  return text.toLowerCase().replace(/[^\w.+#\s-]/g, " ");
}

function extractSkills(text = "") {
  const normalized = normalize(text);
  return SKILLS.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|\\W)${escaped}(\\W|$)`, "i").test(normalized);
  }).map((skill) => skill === "nodejs" ? "node.js" : skill === "nextjs" ? "next.js" : skill);
}

function assess(resumeText, jobDescription) {
  const resumeSkills = [...new Set(extractSkills(resumeText))];
  const requiredSkills = [...new Set(extractSkills(jobDescription))];
  const matchedSkills = requiredSkills.filter((skill) => resumeSkills.includes(skill));
  const missingSkills = requiredSkills.filter((skill) => !resumeSkills.includes(skill));
  const score = requiredSkills.length
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  const suggestions = [];
  if (missingSkills.length) {
    suggestions.push(`Add truthful examples demonstrating these required skills where applicable: ${missingSkills.join(", ")}.`);
  }
  if (!resumeText || resumeText.trim().length < 250) {
    suggestions.push("Your resume text appears short. Add a concise professional summary, relevant experience, projects, and measurable outcomes.");
  }
  if (!suggestions.length) {
    suggestions.push("Your resume contains the skills detected in this job description. Strengthen it with measurable achievements and role-specific examples.");
  }

  return {
    score,
    matchedSkills,
    missingSkills,
    resumeSkills,
    requiredSkills,
    suggestions,
    summary: requiredSkills.length
      ? `Detected ${matchedSkills.length} of ${requiredSkills.length} skills mentioned in the job description.`
      : "No supported skills were detected in the job description. Add specific skills and requirements for a more useful comparison."
  };
}

module.exports = { assess, extractSkills };
