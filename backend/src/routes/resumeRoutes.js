const router = require("express").Router();
const protect = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  listResumes, uploadResume, deleteResume, downloadResume
} = require("../controllers/resumeController");

router.use(protect);
router.get("/", listResumes);
router.post("/upload", upload.single("resume"), uploadResume);
router.get("/:id/download", downloadResume);
router.delete("/:id", deleteResume);

module.exports = router;
