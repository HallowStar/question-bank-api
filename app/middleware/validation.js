// questionValidation.js (or just above your controllers)
const validateQuestionInput = (req, res, next) => {
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

  if (
    !text ||
    !type ||
    !correctAnswer ||
    !difficulty ||
    !topicCode ||
    !subjectCode
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Validate Type & Options
  if (type === "multiple-choice") {
    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        message: "Multiple choice at least 2 options",
      });
    }
  }

  // If its open-ended, the options will be empty
  else if (type === "open-ended") {
    req.body.options = [];
  } else {
    return res.status(400).json({ message: "Invalid question type" });
  }

  // Check if difficulty is valid
  const cleanDifficulty = difficulty.trim().toLowerCase();

  if (!["easy", "medium", "hard"].includes(cleanDifficulty)) {
    return res
      .status(400)
      .json({ message: "Difficulty must be easy, medium, or hard" });
  }

  req.body.difficulty = cleanDifficulty;

  // Validate tag
  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    return res.status(400).json({ message: "Tags must not be empty" });
  }

  req.body.tags = tags.map((tag) => tag.toLowerCase());

  next();
};

module.exports = { validateQuestionInput };
