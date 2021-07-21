const router = require("express").Router();

router.get("/", (request, response) => {
  response.send("You have reached the path to authenticate as a faculty member. Beware!");
});

module.exports = router;
