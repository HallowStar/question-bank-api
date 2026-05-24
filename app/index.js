// Import Libraries
const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const cors = require("cors");
const ejs = require("ejs");

require("dotenv").config();
const port = process.env.PORT;

// Create the app
const app = express();

// Redirect the app
app.set("views", path.join(__dirname, "views"));

// Initialize the app
app.set("view engine", "ejs");
app.use(cors());
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Set the base layout o
app.set("layout", "layouts/base");

// Routes
const questionRouter = require("./routes/questionRoutes");

app.use("/question", questionRouter);

// Run the app
app.listen(port, () => {
  console.log("Server is running on ", port);
});
