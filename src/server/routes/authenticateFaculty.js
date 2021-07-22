const router = require("express").Router();

router.get("/", (request, response) => {
  console.log(request.headers.employeenumber)
  response.send("You have reached the path to authenticate as a faculty member. Beware!");
});

module.exports = router;
