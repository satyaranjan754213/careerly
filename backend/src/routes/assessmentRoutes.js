const router = require("express").Router();
const protect = require("../middleware/auth");
const { listAssessments, createAssessment } = require("../controllers/assessmentController");

router.use(protect);
router.get("/", listAssessments);
router.post("/", createAssessment);

module.exports = router;
