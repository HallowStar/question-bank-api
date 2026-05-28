const { ObjectId } = require("mongodb");

// Get list of subjects
const getSubjects = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const subjects = await db.collection("subjects").find().toArray();

    return res
      .status(200)
      .json({ message: "Subject Found Successfully", subjects });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

// Search Subject by id
const searchSubjectById = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    // Check if ID is valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid subject ID format" });
    }

    const result = await db
      .collection("subjects")
      .findOne({ _id: new ObjectId(id) });

    if (!result) return res.status(404).json({ message: "Subject not found" });

    return res.status(200).json({ message: "Subject found", result });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", details: error.message });
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

    const cleanCode = code.toUpperCase();

    // Check for any duplicated subjects
    const existingSubject = await db
      .collection("subjects")
      .findOne({ code: cleanCode });

    if (existingSubject) {
      return res.status(400).json({
        message: "The subject already exist",
      });
    }

    // Add question
    const newSubject = {
      name,
      department,
      description,
      code: cleanCode,
    };

    const result = await db.collection("subjects").insertOne(newSubject);

    return res
      .status(200)
      .json({ message: "Subject added successfully", result });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", details: error.message });
  }
};

// Edit Subject (only teacher allowed)
const editSubject = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { role } = req.user;

    const { name, department, description, code } = req.body;

    // Check if ID is valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid subject ID format" });
    }

    if (role !== "teacher")
      return res
        .status(403)
        .json({ message: "You must be a teacher to proceed" });

    const cleanCode = code.toUpperCase();

    // Check for any subject duplicates
    const existingSubject = await db.collection("subjects").findOne({
      code: cleanCode,
      _id: { $ne: new ObjectId(id) }, // $ne means "Not Equal"
    });

    console.log(existingSubject);

    if (existingSubject) {
      return res.status(400).json({
        message: "Subject already exist",
      });
    }

    // Input Validation
    if (!name || !department || !description || !code) {
      return res.status(400).json({ message: "Missing required field" });
    }

    // Add question
    const editSubject = {
      name,
      department,
      description,
      code: cleanCode,
    };

    const result = await db.collection("subjects").updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: editSubject,
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
      .json({ message: "Internal server error", details: error.message });
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

    // Check if ID is valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid subject ID format" });
    }

    const result = await db.collection("subjects").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Delete questions or topics that is related to the subject
    await db
      .collection("questions")
      .deleteMany({ subjectId: new ObjectId(id) });

    await db.collection("topics").deleteMany({ subjectId: new ObjectId(id) });

    return res
      .status(200)
      .json({ message: "Subject and related data deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", details: error.message });
  }
};

module.exports = {
  getSubjects,
  searchSubjectById,
  addSubject,
  editSubject,
  deleteSubject,
};
