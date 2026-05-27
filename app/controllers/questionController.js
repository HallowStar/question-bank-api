const { ObjectId } = require("mongodb");

// Get Lists of Questions
const getQuestions = async (req, res) => {
  try {
    const db = req.app.locals.db;

    // Combine collections into one document
    const questions = await db
      .collection("questions")
      .aggregate([
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
          },
        },
        {
          $project: {
            _id: 0,
            topicId: 0,
            subjectId: 0,
            "topicInfo._id": 0,
            "subjectInfo._id": 0,
          },
        },
      ])
      .toArray();

    // Check if question exist
    if (questions.length == 0) {
      return res.status(400).json({ error: "No questions found" });
    }

    return res.status(200).json({ questions });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Search Question by id

// Search questions based on name, difficulty, topic, subject, tags
const searchQuestion = async (req, res) => {
  try {
    const { name, difficulty, topic, subject, tags } = req.query;

    const db = req.app.locals.db;

    let query = {};

    // Validate input depending on the search query
    if (name) {
      query.text = { $regex: name, $options: "i" };
    }

    if (difficulty) {
      const difficultyArray = difficulty.split(",");

      difficultyArray.map((d) => d.toLowerCase());

      query.difficulty = { $in: difficultyArray };
    }

    // Check if topic exist in the database
    if (topic) {
      const topicDb = await db
        .collection("topics")
        .findOne({ code: topic.toUpperCase() });

      if (!topicDb)
        return res.status(400).json({ message: "Topic does not exist" });

      query.topicId = topicDb._id;
    }

    // Check by tag
    if (tags.length > 0) {
      const tagArray = tags.split(",").map((tag) => tag.toLowerCase());
      query.tags = { $in: tagArray };
    }

    // Check if subject exist in the database
    if (subject) {
      const subjectDb = await db
        .collection("subjects")
        .findOne({ code: subject.toUpperCase() });

      if (!subjectDb)
        return res.status(400).json({ message: "Topic does not exist" });

      query.subjectId = subjectDb._id;
    }

    // Get results based on the query
    const result = await db.collection("questions").find(query).toArray();

    // Check if question is found
    if (result.length == 0) {
      return res.status(404).json({ message: "Question not found" });
    }

    return res.status(200).json({ message: "Question found", result: result });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Add question (only teacher)
const addQuestion = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { userId, role } = req.user;
    const {
      text,
      type,
      options,
      correctAnswer,
      difficulty,
      tags,
      topicCode,
      subjectCode,
    } = req.body;

    if (role !== "teacher")
      return res
        .status(401)
        .json({ message: "You must be a teacher to proceed" });

    // Input Validation
    if (
      !text ||
      !type ||
      !correctAnswer ||
      !difficulty ||
      !topicCode ||
      !subjectCode
    ) {
      return res.status(400).json({ message: "Missing required field" });
    }

    if (type == "multiple-choice") {
      if (!Array.isArray(options)) {
        return res
          .status(400)
          .json({ message: "Multiple choice require at least 2 options" });
      }
    } else if (type !== "open-ended") {
      return res.status(400).json({
        message:
          "Invalid question type (must be 'multiple-choice' or 'open-ended')",
      });
    }

    const cleanDifficulty = difficulty.trim().toLowerCase();

    console.log(cleanDifficulty);

    // Check if difficulty is valid
    if (
      cleanDifficulty !== "medium" &&
      cleanDifficulty !== "easy" &&
      cleanDifficulty !== "hard"
    )
      return res.status(400).json({
        message: "Difficulty not valid (must be 'easy', 'medium' or 'hard'",
      });

    // Check if tags are empty
    if (tags.length == 0)
      return res.status(400).json({ message: "Missing Tags" });

    // Check if topic & subject exist
    const topicDb = await db.collection("topics").findOne({ code: topicCode });
    if (!topicDb)
      return res.status(404).json({ message: "Topic does not exist" });

    const subjectDb = await db
      .collection("subjects")
      .findOne({ code: subjectCode });
    if (!subjectDb)
      return res.status(404).json({ message: "Subject does not exist" });

    // Add question
    const newQuestion = {
      _id: new ObjectId(),
      text,
      type,
      difficulty: cleanDifficulty,
      options,
      correctAnswer,
      tags: tags.map((tag) => tag.toLowerCase()),
      authorId: new ObjectId(userId),
      topicId: topicDb._id,
      subjectId: subjectDb._id,
    };

    const result = await db.collection("questions").insertOne(newQuestion);

    return res
      .status(200)
      .json({ message: "Question added successfully", result });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Edit question (only teacher that has the question)
const editQuestion = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { userId, role } = req.user;

    const {
      text,
      type,
      options,
      correctAnswer,
      difficulty,
      tags,
      topicCode,
      subjectCode,
    } = req.body;

    if (role !== "teacher")
      return res
        .status(401)
        .json({ message: "You must be a teacher to proceed" });

    // Input Validation
    if (
      !text ||
      !correctAnswer ||
      !Array.isArray(options) ||
      !difficulty ||
      !topicCode ||
      !subjectCode
    ) {
      return res.status(400).json({ message: "Missing required field" });
    }

    if (type == "multiple-choice") {
      if (!Array.isArray(options)) {
        return res
          .status(400)
          .json({ message: "Multiple choice require at least 2 options" });
      }
    } else if (type !== "open-ended") {
      return res.status(400).json({
        message:
          "Invalid question type (must be 'multiple-choice' or 'open-ended')",
      });
    }

    const cleanDifficulty = difficulty.trim().toLowerCase();

    // Check if difficulty is valid
    if (
      cleanDifficulty !== "medium" &&
      cleanDifficulty !== "easy" &&
      cleanDifficulty !== "hard"
    )
      return res.status(400).json({ message: "Difficulty not valid" });

    // Check if tags are empty
    if (tags.length == 0)
      return res.status(400).json({ message: "Missing Tags" });

    // Check if topic & subject exist
    const topicDb = await db.collection("topics").findOne({ code: topicCode });
    if (!topicDb)
      return res.status(404).json({ message: "Topic does not exist" });

    const subjectDb = await db
      .collection("subjects")
      .findOne({ code: subjectCode });
    if (!subjectDb)
      return res.status(404).json({ message: "Subject does not exist" });

    // Add question
    const newQuestion = {
      text,
      type,
      difficulty: cleanDifficulty,
      options,
      correctAnswer,
      tags: tags.map((tag) => tag.toLowerCase()),
      authorId: new ObjectId(userId),
      topicId: topicDb._id,
      subjectDb: subjectDb._id,
    };

    const result = await db.collection("questions").updateOne(
      {
        _id: new ObjectId(id),
        authorId: new ObjectId(userId),
      },
      {
        $set: newQuestion,
      }
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "Question not found or unauthorized" });
    }

    return res
      .status(200)
      .json({ message: "Question updated successfully", result });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete question
const deleteQuestion = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id, role } = req.params;
    const { userId } = req.params;

    if (role !== "teacher") {
      return res
        .status(400)
        .json({ message: "You must be a teacher to proceed" });
    }

    const result = await db.collection("questions").deleteOne({
      _id: new ObjectId(id),
      authorId: new ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Question not found" });
    }

    return res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Question Deleted Successfully", error: error.message });
  }
};

// Answer question
const answerQuestion = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { userId, role } = req.user;
    const { answer } = req.body;

    // Must provide answer if student
    if (role !== "student") {
      return res
        .status(401)
        .json({ message: "You must be a student to answer" });
    }

    const newAnswer = {
      answer_id: new ObjectId(),
      user_id: new ObjectId(userId),
      answer: answer,
      lastUpdated: new Date(),
    };

    const answerBank = await db
      .collection("questions")
      .updateOne(
        { _id: new ObjectId(id) },
        { $push: { answerBank: newAnswer } }
      );

    if (answerBank.matchedCount == 0)
      return res.status(400).json({ message: "Question not found" });

    return res.status(200).json({ message: "Answer added successfully" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Edit answer
const editAnswer = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id, answerId } = req.params;
    const { userId, role } = req.user;
    const { answer, feedback } = req.body;

    let query = {};

    // Must provide answer if student
    if (role == "student") {
      if (!answer)
        return res.status(400).json({ message: "You must provide answer" });
      query = {
        "answerBank.$.answer": answer,
        "answerBank.$.lastUpdated": new Date(),
      };
    }

    // Must provide feedback if student
    else if (role == "teacher") {
      if (!feedback)
        return res.status(400).json({ message: "You must provide feedback" });
      query = {
        "answerBank.$.feedback": feedback,
        "answerBank.$.lastUpdated": new Date(),
      };
    } else {
      return res.status(500).json({ message: "You are not authorized" });
    }

    const answerBank = await db.collection("questions").updateOne(
      {
        _id: new ObjectId(id),
        "answerBank.answer_id": new ObjectId(answerId),
      },
      { $set: query }
    );

    if (answerBank.matchedCount == 0)
      return res.status(400).json({ message: "Question or answer not found" });

    return res.status(200).json({ message: "Answer edited successfully" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Delete Answer
const deleteAnswer = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { userId, role } = req.user;
    const { id, answerId } = req.params;

    // Teacher can only remove their feedback
    if (role === "teacher") {
      const result = await db.collection("questions").updateOne(
        {
          _id: new ObjectId(id),
          "answerBank.answer_id": new ObjectId(answerId),
        },
        {
          $unset: { "answerBank.$.feedback": "" },
        }
      );

      if (result.matchedCount == 0)
        return res
          .status(400)
          .json({ message: "Question or answer not found" });
    }
    // Student can remove their answer
    else if (role === "student") {
      const result = await db.collection("questions").updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $pull: {
            answerBank: {
              answer_id: new ObjectId(answerId),
              userId: new ObjectId(userId),
            },
          },
        }
      );

      if (result.matchedCount == 0)
        return res
          .status(400)
          .json({ message: "Question or answer not found" });
    }

    res.status(200).json({ messsage: "Answer Bank updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Remove question (only for teacher that has the question)
module.exports = {
  getQuestions,
  searchQuestion,
  addQuestion,
  editQuestion,
  deleteQuestion,
  answerQuestion,
  editAnswer,
  deleteAnswer,
};
