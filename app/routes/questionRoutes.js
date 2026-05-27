const express = require("express");
const route = express.Router();
const {
  getQuestions,
  searchQuestion,
  addQuestion,
  editQuestion,
  deleteQuestion,
  answerQuestion,
  editAnswer,
  deleteAnswer,
  searchQuestionById,
} = require("../controllers/questionController");
const { verifyAccessToken } = require("../middleware/authentication");

route.route("/").get(getQuestions);
route.route("/search").get(searchQuestion);
route.route("/:id").get(searchQuestionById);
route.route("/").post(verifyAccessToken, addQuestion);
route.route("/:id").put(verifyAccessToken, editQuestion);
route.route("/:id").delete(verifyAccessToken, deleteQuestion);
route.route("/:id/answer").post(verifyAccessToken, answerQuestion);
route.route("/:id/answer/:answerId").put(verifyAccessToken, editAnswer);
route.route("/:id/answer/:answerId").delete(verifyAccessToken, deleteAnswer);

module.exports = route;
