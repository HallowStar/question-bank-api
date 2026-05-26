const express = require("express");
const route = express.Router();
const {
  getQuestions,
  searchQuestion,
  addQuestion,
  editQuestion,
} = require("../controllers/questionController");
const { verifyAccessToken } = require("../middleware/authentication");

route.route("/").get(getQuestions);
route.route("/search").get(searchQuestion);
route.route("/").post(verifyAccessToken, addQuestion);
route.route("/:id").put(verifyAccessToken, editQuestion);

module.exports = route;
