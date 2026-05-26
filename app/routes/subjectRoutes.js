const express = require("express");
const { getSubjects } = require("../controllers/subjectController");
const router = express.Router();

router.route("/").get(getSubjects);

module.exports = router;
