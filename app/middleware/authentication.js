const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateAccessToken = (id, email, role) => {
  return jwt.sign(
    { userId: id, email: email, role: role },
    process.env.TOKEN_SECRET,
    {
      expiresIn: "1hr",
    }
  );
};

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader.split(" ")[1];

  if (!token) return res.sendStatus(403);

  // Check if it expires or valid
  jwt.verify(token, process.env.TOKEN_SECRET, function (error, user) {
    if (error) {
      return res.sendStatus(403);
    }

    req.user = user;
    console.log(req.user);
    next();
  });
};

module.exports = { generateAccessToken, verifyAccessToken };
