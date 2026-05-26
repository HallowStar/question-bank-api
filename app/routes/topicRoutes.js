const express = require("express");
const { getTopics } = require("../controllers/topicController");
const router = express.Router();

router.route("/").get(getTopics);

module.exports = router;
