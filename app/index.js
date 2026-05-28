// Import Libraries
const express = require("express");
const cors = require("cors");

require("dotenv").config();
const mongoURI = process.env.MONGO_URI;
const dbName = "question-bank";
const port = process.env.PORT;

// Create the app
const app = express();
const { connectDb } = require("./config/db");

// Initialize the app
app.set("view engine", "ejs");
app.use(cors());
app.use(express.json());

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
    const subjectRouter = require("./routes/subjectRoutes");
    const topicRouter = require("./routes/topicRoutes");

    app.use("/api/question", questionRouter);
    app.use("/api/subject", subjectRouter);
    app.use("/api/topic", topicRouter);
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
