const router = require("express").Router();
const protect = require("../middleware/auth");
const { listJobs, createJob, deleteJob } = require("../controllers/jobController");

router.use(protect);
router.get("/", listJobs);
router.post("/", createJob);
router.delete("/:id", deleteJob);

module.exports = router;
