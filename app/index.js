// Import Libraries
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const cors = require("cors");
const ejs = require("ejs");

require("dotenv").config();
const mongoURI = process.env.MONGO_URI;
const dbName = "question-name";
const port = process.env.PORT;

// Create the app
const app = express();

// Initialize the app
app.set("view engine", "ejs");
app.use(cors());
app.use(express.json());
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.set("layout", "layouts/base");

// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Run the app
app.listen(port, () => {
  console.log("Server is running on ", port);
});
