const { ObjectId } = require("mongodb");

// Get Lists of Topics
const getTopics = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const topics = await db
      .collection("topics")
      .aggregate([
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
            subjectId: 0,
            "subjectInfo._id": 0,
          },
        },
      ])
      .toArray();

    return res
      .status(200)
      .json({ message: "Topics Found Successfully", topics });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      error: error.message,
      details: error.message,
    });
  }
};

// Search Topic by id
const searchTopicById = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    // Check if ID is valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid topic ID format" });
    }

    const result = await db
      .collection("topics")
      .findOne({ _id: new ObjectId(id) });

    if (!result) return res.status(404).json({ message: "Topic not found" });

    return res.status(200).json({ message: "Topic found", result });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", details: error.message });
  }
};

// Add question (only teacher)
const addTopic = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { role } = req.user;
    const { name, subjectCode, description, code } = req.body;

    if (role !== "teacher")
      return res
        .status(403)
        .json({ message: "You must be a teacher to proceed" });

    // Input Validation
    if (!name || !subjectCode || !description || !code) {
      return res.status(400).json({ message: "Missing required field" });
    }

    const cleanCode = code.toUpperCase();

    // Check for duplicated topics
    const existingTopic = await db
      .collection("topics")
      .findOne({ code: cleanCode });

    if (existingTopic) {
      return res.status(400).json({ message: "Topic already exist" });
    }

    const subjectDb = await db
      .collection("subjects")
      .findOne({ code: subjectCode.toUpperCase() });

    if (!subjectDb)
      return res.status(404).json({ message: "Subject does not exist" });

    // Add question
    const newTopic = {
      name,
      subjectId: subjectDb._id,
      description,
      code: cleanCode,
    };

    const result = await db.collection("topics").insertOne(newTopic);

    return res
      .status(200)
      .json({ message: "Topic added successfully", result });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", details: error.message });
  }
};

// Edit Subject (only teacher allowed)
const editTopic = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { role } = req.user;
    const { name, subjectCode, description, code } = req.body;

    // Check if ID is valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid topic ID format" });
    }

    if (role !== "teacher")
      return res
        .status(403)
        .json({ message: "You must be a teacher to proceed" });

    // Input Validation
    if (!name || !subjectCode || !description || !code) {
      return res.status(400).json({ message: "Missing required field" });
    }

    const cleanCode = code.toUpperCase();

    // Check for duplicated topic
    const existingTopic = await db.collection("topics").findOne({
      code: cleanCode,
      _id: { $ne: new ObjectId(id) },
    });

    if (existingTopic) {
      return res.status(403).json({ message: "Topic already exist" });
    }

    // Check if subject exist
    const subjectDb = await db
      .collection("subjects")
      .findOne({ code: subjectCode.toUpperCase() });

    if (!subjectDb) {
      return res.status(500).json({ message: "Subject does not exist" });
    }

    // Add question
    const editTopic = {
      name,
      subjectCode: subjectDb._id,
      description,
      code: cleanCode,
    };

    const result = await db.collection("topics").updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: editTopic,
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }

    return res
      .status(200)
      .json({ message: "Topic updated successfully", result });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};

// Delete question
const deleteTopic = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { role } = req.user;

    // Check if ID is valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid topic ID format" });
    }

    if (role !== "teacher") {
      return res
        .status(400)
        .json({ message: "You must be a teacher to proceed" });
    }

    const result = await db.collection("topics").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Delete questions with the topic
    await db.collection("questions").deleteMany({ topicId: new ObjectId(id) });

    return res.status(200).json({ message: "Topic deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", details: error.message });
  }
};

module.exports = {
  getTopics,
  searchTopicById,
  addTopic,
  editTopic,
  deleteTopic,
};
