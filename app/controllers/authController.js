require("dotenv").config();
const bcrypt = require("bcrypt");

const { ObjectId } = require("mongodb");
const { generateAccessToken } = require("../middleware/authentication");
const { isValidEmail } = require("../utils/validation");

// Register User
const registerUser = async (req, res) => {
  try {
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

    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail))
      return res.status(400).json({ error: "Invalid Email Format" });

    // Check if date format or value is valid
    const birthFormat = new Date(birthDate);

    if (isNaN(birthFormat.getTime())) {
      return res.status(400).json({ error: "Date must be in YY-MM-DD format" });
    }

    // Password must be minimum 8 characters
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must have minimum 8 characters" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Password not match" });
    }

    // Check if email already exists
    const user = await db
      .collection("users")
      .findOne({ "contact.email": cleanEmail });

    if (user) return res.status(400).json({ error: "User already exists" });

    // Hash Password
    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = {
      _id: new ObjectId(),
      name,
      birthDate: new Date(birthDate),
      role,
      address,
      contact: { number: Number(contact), email: cleanEmail },
      passwordHash,
    };

    // Insert to database
    const result = await db.collection("users").insertOne(newUser);

    return res
      .status(200)
      .json({ message: "Account Created Successfully", result });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", error: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const { email, password } = req.body;

    // Input Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email & Password Required" });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!isValidEmail(cleanEmail))
      return res.status(400).json({ error: "Invalid email format" });

    const user = await db
      .collection("users")
      .findOne({ "contact.email": email });

    // Check if the email exist
    if (!user) return res.status(404).json({ error: "User Not Found" });

    // Compare password
    const matchedPassword = await bcrypt.compare(password, user.passwordHash);

    // Check if password matches
    if (!matchedPassword)
      return res.status(401).json({ error: "Incorrect Password" });

    // Generate access token
    const accessToken = generateAccessToken(user._id, user.email, user.role);

    return res.status(200).json({ message: "Login Successfull", accessToken });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", error: error.message });
  }
};

module.exports = { registerUser, loginUser };
