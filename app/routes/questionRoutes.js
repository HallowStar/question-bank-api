const express = require("express");
const route = express.Router();
const {
  getQuestions,
  searchQuestion,
  addQuestion,
} = require("../controllers/questionController");
const { verifyAccessToken } = require("../middleware/authentication");

route.route("/").get(getQuestions);
route.route("/search").get(searchQuestion);
route.route("/").post(verifyAccessToken, addQuestion);

module.exports = route;
