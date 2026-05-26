const express = require("express");
const route = express.Router();
const {
  getQuestions,
  searchQuestion,
} = require("../controllers/questionController");

route.route("/").get(getQuestions);
route.route("/search").get(searchQuestion);

module.exports = route;
