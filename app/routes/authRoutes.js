const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

router.route("/register").post(registerUser);
// router.route("/register").get(registerForm);

router.route("/login").post(loginUser);
// router.route("/login").get(loginUser);

module.exports = router;
