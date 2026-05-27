const express = require("express");
const {
  getTopics,
  addTopic,
  editTopic,
  deleteTopic,
} = require("../controllers/topicController");
const { verifyAccessToken } = require("../middleware/authentication");
const router = express.Router();

router.route("/").get(getTopics);
router.route("/").post(verifyAccessToken, addTopic);
router.route("/:id").put(verifyAccessToken, editTopic);
router.route("/:id").delete(verifyAccessToken, deleteTopic);

module.exports = router;
