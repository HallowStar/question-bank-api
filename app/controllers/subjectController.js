const { ObjectId } = require("mongodb");

// Get list of subjects
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

// Search Subject by id
const searchSubjectById = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    console.log(id);

    const result = await db
      .collection("subjects")
      .findOne({ _id: new ObjectId(id) });

    if (!result) return res.status(400).json({ message: "Subject not found" });

    return res.status(200).json({ message: "Subject found", result });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
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
      .json({ message: "Subject added successfully", result });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Edit Subject (only teacher allowed)
const editSubject = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
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
      name,
      department,
      description,
      code: code.toUpperCase(),
    };

    const result = await db.collection("subjects").updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: newSubject,
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Subject not found" });
    }

    return res
      .status(200)
      .json({ message: "Subject updated successfully", result });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete question
const deleteSubject = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { role } = req.user;

    if (role !== "teacher") {
      return res
        .status(400)
        .json({ message: "You must be a teacher to proceed" });
    }

    const result = await db.collection("subjects").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Subject not found" });
    }

    await db
      .collection("questions")
      .deleteMany({ subjectId: new ObjectId(id) });

    await db.collection("topics").deleteMany({ subjectId: new ObjectId(id) });

    return res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = {
  getSubjects,
  searchSubjectById,
  addSubject,
  editSubject,
  deleteSubject,
};
