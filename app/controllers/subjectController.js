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
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getSubjects };
