const router = require("express").Router();

router.all("/", (request, response) => {
  response.sendStatus(200);
});

module.exports = router;