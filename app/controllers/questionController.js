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
          $project: {
            topicId: 0,
            subjectId: 0,
            authorId: 0,
            "authorInfo.passwordHash": 0,
          },
        },
      ])
      .toArray();

    return res.status(200).json({ questions });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

// Search Question by id
const searchQuestionById = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    // Check if ID is valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid question ID format" });
    }

    const result = await db
      .collection("questions")
      .findOne({ _id: new ObjectId(id) });

    if (!result) return res.status(404).json({ message: "Question not found" });

    return res.status(200).json({ message: "Question found", result });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

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

      difficultyArray = difficultyArray.map((d) => d.toLowerCase());

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
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.toLowerCase());
      console.log(tagArray);
      query.tags = { $in: tagArray };
    }

    // Check if subject exist in the database
    if (subject) {
      const subjectDb = await db
        .collection("subjects")
        .findOne({ code: subject.toUpperCase() });

      if (!subjectDb)
        return res.status(400).json({ message: "Subject does not exist" });

      query.subjectId = subjectDb._id;
    }

    // Get results based on the query
    const result = await db.collection("questions").find(query).toArray();

    return res.status(200).json({ message: "Question found", result: result });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", details: error.message });
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

    // Check if user is a teacher
    if (role !== "teacher")
      return res
        .status(401)
        .json({ message: "You must be a teacher to proceed" });

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
      difficulty,
      options,
      correctAnswer,
      tags,
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
        .status(403)
        .json({ message: "You must be a teacher to proceed" });

    // Check if ID is valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid question ID format" });
    }

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
    const editQuestion = {
      text,
      type,
      difficulty,
      options,
      correctAnswer,
      tags,
      authorId: new ObjectId(userId),
      topicId: topicDb._id,
      subjectId: subjectDb._id,
    };

    const result = await db.collection("questions").updateOne(
      {
        _id: new ObjectId(id),
        authorId: new ObjectId(userId),
      },
      {
        $set: editQuestion,
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
      .json({ message: "Internal server error", details: error.message });
  }
};

// Delete question
const deleteQuestion = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { userId, role } = req.user;

    if (role !== "teacher") {
      return res
        .status(403)
        .json({ message: "You must be a teacher to proceed" });
    }

    // Check if ID is valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid question ID format" });
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
    return res.status(500).json({
      message: "Internal Server Error",
      details: error.message,
    });
  }
};

// Answer question
const answerQuestion = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { userId, role } = req.user;
    const { answer } = req.body;

    // Check if ID is valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid question ID format" });
    }

    // Must provide answer if student
    if (role !== "student") {
      return res
        .status(403)
        .json({ message: "You must be a student to answer" });
    }

    if (!answer) return res.status(400).json({ message: "Answer is required" });

    const newAnswer = {
      answer_id: new ObjectId(),
      user_id: new ObjectId(userId),
      answer: answer,
      lastUpdated: new Date(),
    };

    const result = await db
      .collection("questions")
      .updateOne(
        { _id: new ObjectId(id) },
        { $push: { answerBank: newAnswer } }
      );

    if (result.matchedCount == 0)
      return res.status(404).json({ message: "Question not found" });

    return res.status(200).json({ message: "Answer added successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", details: error.message });
  }
};

// Edit answer
const editAnswer = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id, answerId } = req.params;
    const { role, userId } = req.user;
    const { answer, feedback } = req.body;

    // Check if ID is valid
    if (!ObjectId.isValid(id) || !ObjectId.isValid(answerId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    let updatedFields = {};

    let queryFilter = {
      _id: new ObjectId(id),
      "answerBank.answer_id": new ObjectId(answerId),
    };

    // Must provide answer if student
    if (role == "student") {
      if (!answer)
        return res.status(400).json({ message: "You must provide answer" });

      // Only the students that answer it can edit their answer
      queryFilter["answerBank.user_id"] = new ObjectId(userId);

      updatedFields = {
        "answerBank.$.answer": answer,
        "answerBank.$.lastUpdated": new Date(),
      };
    }

    // Must provide feedback if student
    else if (role == "teacher") {
      if (!feedback)
        return res.status(400).json({ message: "You must provide feedback" });
      updatedFields = {
        "answerBank.$.feedback": feedback,
        "answerBank.$.lastUpdated": new Date(),
      };
    } else {
      return res.status(403).json({ message: "You are not authorized" });
    }

    const result = await db
      .collection("questions")
      .updateOne(queryFilter, { $set: updatedFields });

    if (result.matchedCount == 0)
      return res.status(404).json({ message: "Question or answer not found" });

    return res.status(200).json({ message: "Answer edited successfully" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Internal Server Error", details: error.message });
  }
};

// Delete Answer
const deleteAnswer = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { userId, role } = req.user;
    const { id, answerId } = req.params;

    // Check if ID is valid
    if (!ObjectId.isValid(id) || !ObjectId.isValid(answerId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

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
          .status(404)
          .json({ message: "Question or answer not found" });
    }
    // Student can remove their answer
    else if (role === "student") {
      const result = await db.collection("questions").updateOne(
        {
          _id: new ObjectId(id),
          "answerBank.answer_id": new ObjectId(answerId),
          "answerBank.user_id": new ObjectId(userId),
        },
        {
          $pull: {
            answerBank: {
              answer_id: new ObjectId(answerId),
              user_id: new ObjectId(userId),
            },
          },
        }
      );

      if (result.matchedCount == 0)
        return res
          .status(404)
          .json({ message: "Question or answer not found" });
    } else {
      return res.status(403).json({ message: "You are not authorized" });
    }

    res.status(200).json({ messsage: "Answer Bank updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", details: error.message });
  }
};

// Remove question (only for teacher that has the question)
module.exports = {
  getQuestions,
  searchQuestion,
  searchQuestionById,
  addQuestion,
  editQuestion,
  deleteQuestion,
  answerQuestion,
  editAnswer,
  deleteAnswer,
};
