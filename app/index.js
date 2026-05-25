// Import Libraries
const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const cors = require("cors");
const ejs = require("ejs");

require("dotenv").config();
const mongoURI = process.env.MONGO_URI;
const dbName = "question-bank";
const port = process.env.PORT;

// Create the app
const app = express();
const { connectDb } = require("./config/db");

// Redirect the app
app.set("views", path.join(__dirname, "views"));

// Initialize the app
app.set("view engine", "ejs");
app.use(cors());
app.use(expressLayouts);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Set the base layout o
app.set("layout", "layouts/base");

async function main() {
  try {
    // DB Conection
    const db = await connectDb(mongoURI, dbName);

    app.locals.db = db;

    // Routes
    const questionRouter = require("./routes/questionRoutes");
    const authRouter = require("./routes/authRoutes");

    app.use("/question", questionRouter);
    app.use("/user", authRouter);
  } catch (error) {
    console.error("MongoDB not Connected: ", error);
  }
}

main();

// Run the app
app.listen(port, () => {
  console.log("Server is running on ", port);
});
