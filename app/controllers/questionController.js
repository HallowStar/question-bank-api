// Get Lists of Questions
const getQuestions = async (req, res) => {
  try {
    const db = req.app.locals.db;

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
      return res.status(400).json({ error: "No questions found" });
    }

    // res.render("questions/bank", { questions });
    return res.status(200).json({ questions });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Search questions based on name
const searchQuestion = async (req, res) => {
  const { name, difficulty, topic, subject } = req.query;

  try {
    const db = req.app.locals.db;

    let query = {};

    // Validate input depending on the search query
    if (name) {
      query.text = { $regex: name, $options: "i" };
    }

    if (difficulty) {
      const difficultyArray = difficulty.split(",");

      query.difficulty = { $in: difficultyArray };
    }

    // Check if topic exist in the database
    if (topic) {
      const topicDb = await db.collection("topics").findOne({ code: topic });

      if (!topicDb)
        return res.status(400).json({ message: "Topic does not exist" });

      query.topic = topicDb._id;
    }

    // Check if subject exist in the database
    if (subject) {
      const subjectDb = await db
        .collection("subjects")
        .findOne({ code: subject });

      if (!subjectDb)
        return res.status(400).json({ message: "Topic does not exist" });

      query.subject = subjectDb._id;
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

// Filter questions based on query (topic, subject, difficulty)

// Add question (only teacher)

// Edit question (only teacher that has the question)

// Remove question (only for teacher that has the question)

module.exports = { getQuestions, searchQuestion };
