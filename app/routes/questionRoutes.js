const express = require("express");
const route = express.Router();
const {
  getQuestions,
  getSubjects,
  getTopics,
} = require("../controllers/questionController");

route.route("/questionsList").get(getQuestions);
route.route("/subjectsList").get(getSubjects);
route.route("/topicsList").get(getTopics);

module.exports = route;
