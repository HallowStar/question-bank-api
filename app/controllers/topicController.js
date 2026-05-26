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
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getTopics };
