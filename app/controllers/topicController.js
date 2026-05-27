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
            _id: 0,
            subjectId: 0,
            "subjectInfo._id": 0,
          },
        },
      ])
      .toArray();

    if (topics.length == 0) {
      return res.status(400).json({ error: "No topics found" });
    }

    return res.status(200).json({ topics });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", error: error.message });
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
        .status(401)
        .json({ message: "You must be a teacher to proceed" });

    // Input Validation
    if (!name || !subjectCode || !description || !code) {
      return res.status(400).json({ message: "Missing required field" });
    }

    // Check if subject exist
    const subjectDb = await db
      .collection("subjects")
      .findOne({ code: subjectCode.toUpperCase() });

    if (!subjectDb)
      return res.status(400).json({ message: "Subject does not exist" });

    // Add question
    const newTopic = {
      _id: new ObjectId(),
      name,
      subjectId: subjectDb._id,
      description,
      code: code.toUpperCase(),
    };

    const result = await db.collection("topics").insertOne(newTopic);

    return res
      .status(200)
      .json({ message: "Topic added successfully", result });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Edit Subject (only teacher allowed)
const editTopic = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { role } = req.user;

    const { name, subjectCode, description, code } = req.body;

    if (role !== "teacher")
      return res
        .status(401)
        .json({ message: "You must be a teacher to proceed" });

    // Input Validation
    if (!name || !subjectCode || !description || !code) {
      return res.status(400).json({ message: "Missing required field" });
    }

    const subjectDb = await db
      .collection("subjects")
      .findOne({ code: subjectCode.toUpperCase() });

    if (!subjectDb) {
      return res.status(500).json({ message: "Subject does not exist" });
    }

    // Add question
    const newTopic = {
      name,
      subjectCode,
      description,
      code: code.toUpperCase(),
    };

    const result = await db.collection("topics").updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: newTopic,
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
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete question
const deleteTopic = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { role } = req.user;

    if (role !== "teacher") {
      return res
        .status(400)
        .json({ message: "You must be a teacher to proceed" });
    }

    const result = await db.collection("topics").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Subject not found" });
    }

    await db
      .collection("questions")
      .deleteMany({ topicId: new ObjectId(id) });

    return res.status(200).json({ message: "Topic deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { getTopics, addTopic, editTopic, deleteTopic };
