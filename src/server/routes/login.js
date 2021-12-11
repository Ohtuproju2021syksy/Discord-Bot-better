require("dotenv").config();
const router = require("express").Router();
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  if (req.body.password != process.env.API_SECRET) {
    return res.status(401).json({
      error: "invalid password",
    });
  }

  const token = jwt.sign({ username: "admin" }, process.env.API_SECRET, { expiresIn: 60 * 60 });
  res.status(200).send({
    token,
    username: "admin",
  });
});

module.exports = router;