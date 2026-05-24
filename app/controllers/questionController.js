require("dotenv").config();
const mongoURI = process.env.MONGO_URI;
const dbName = "question-bank";
const port = process.env.PORT;

const { connectDb } = require("../config/db");

const getQuestions = async (req, res) => {
  try {
    const db = await connectDb(mongoURI, dbName);

    const questions = await db
      .collection("questions")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "authorId",
            foreignField: "_id",
            as: "authorInfo",
          },
        },
        {
          $unwind: {
            path: "$authorInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "topics",
            localField: "topicId",
            foreignField: "_id",
            as: "topicInfo",
          },
        },
        {
          $unwind: {
            path: "$topicInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "subjects",
            localField: "subjectId",
            foreignField: "_id",
            as: "subjectInfo",
          },
        },
        {
          $unwind: {
            path: "$subjectInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            authorId: 0,
            topicId: 0,
            subjectId: 0,
            "authorInfo._id": 0,
            "topicInfo._id": 0,
            "subjectInfo._id": 0,
          },
        },
      ])
      .toArray();

    if (questions.length == 0) {
      res.status(400).render("error", {
        error: { statusCode: 404, message: error.message },
      });
    }

    res.render("questions/bank", { questions });
  } catch (error) {
    res
      .status(500)
      .render("error", { error: { statusCode: 500, message: error.message } });
  }
};

module.exports = { getQuestions };
