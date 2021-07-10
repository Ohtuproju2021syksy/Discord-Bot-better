const router = require("express").Router();

router.all("*", (request, response) => {
  response.redirect("/");
});

module.exports = router;