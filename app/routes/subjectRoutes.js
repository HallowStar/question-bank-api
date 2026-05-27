const express = require("express");
const {
  getSubjects,
  addSubject,
  editSubject,
  deleteSubject,
} = require("../controllers/subjectController");
const { verifyAccessToken } = require("../middleware/authentication");
const router = express.Router();

router.route("/").get(getSubjects);
router.route("/").post(verifyAccessToken, addSubject);
router.route("/").put(verifyAccessToken, editSubject);
router.route("/").delete(verifyAccessToken, deleteSubject);

module.exports = router;
