const express = require("express");
const route = express.Router();
const { getQuestions } = require("../controllers/questionController");

route.route("/").get(getQuestions);

module.exports = route;
