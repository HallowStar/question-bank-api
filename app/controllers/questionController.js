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

module.exports = { getQuestions };
