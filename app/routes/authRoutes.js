const express = require("express");
const router = express.Router();
const { registerUser, registerForm } = require("../controllers/authController");

router.route("/register").post(registerUser);
router.route("/register").get(registerForm);

module.exports = router;
