require("dotenv").config();
const bcrypt = require("bcrypt");

const { ObjectId } = require("mongodb");

const registerForm = async (req, res) => {
  res.render("authentication/register");
};

const registerUser = async (req, res) => {
  const db = req.app.locals.db;

  const {
    name,
    contact,
    email,
    password,
    confirmPassword,
    birthDate,
    address,
    role,
  } = req.body;

  // Input validation
  if (
    !name ||
    !role ||
    !email ||
    !contact ||
    !password ||
    !confirmPassword ||
    !birthDate
  ) {
    return res.status(400).json({ error: "Missing Required Fields" });
  }

  if (!email.includes("@")) {
    return res.status(400).json({ error: "Invalid Email Format" });
  }

  const birthFormat = new Date(birthDate);

  if (isNaN(birthFormat.getTime())) {
    return res.status(400).json({ error: "Date must be in YY-MM-DD format" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must have minimum 8 characters" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Password not match" });
  }

  // Hash Password
  const passwordHash = await bcrypt.hash(password, 12);

  const newUser = {
    _id: new ObjectId(),
    name,
    birthDate: new Date(birthDate),
    role,
    address,
    contact: { number: Number(contact), email: email },
    passwordHash,
  };

  console.log(newUser);

  const result = await db.collection("users").insertOne(newUser);

  return res
    .status(200)
    .json({ message: "Account Created Successfully", result });
};

module.exports = { registerUser, registerForm };
