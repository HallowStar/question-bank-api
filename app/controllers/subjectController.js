const getSubjects = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const subjects = await db
      .collection("subjects")
      .find()
      .project({ _id: 0 })
      .toArray();

    if (subjects.length == 0) {
      return res.status(400).json({ error: "No subjects found" });
    }

    // res.render("questions/bank", { questions });
    return res.status(200).json({ subjects });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", error: error.message });
  }
};

// Add question (only teacher)
const addSubject = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { role } = req.user;
    const { name, department, description, code } = req.body;

    if (role !== "teacher")
      return res
        .status(401)
        .json({ message: "You must be a teacher to proceed" });

    // Input Validation
    if (!name || !department || !description || !code) {
      return res.status(400).json({ message: "Missing required field" });
    }

    // Add question
    const newSubject = {
      _id: new ObjectId(),
      name,
      department,
      description,
      code: code.toUpperCase(),
    };

    const result = await db.collection("subjects").insertOne(newSubject);

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
const editSubject = async (req, res) => {
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
      tags,
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
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete question
const deleteSubject = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { userId } = req.params;

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
      .json({ message: "Question Deleted Successfully", result });
  }
};

module.exports = { getSubjects, addSubject, editSubject, deleteSubject };
