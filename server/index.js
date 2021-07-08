require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const session = require("express-session");
const passport = require("passport");
const password = require("passport");
const authRoute = require("./routes/auth");
const DiscordStrategy = require("./strategies/discordstrategy");

app.use(session ({
  secret: "some random secret",
  cookie: {
    maxAge: 36000,
  },
  saveUninitialized: false,
  resave:false,
}));

app.use(password.initialize());

app.use(passport.session());

app.use("/auth", authRoute);
/* app.get("/", (req, res) => {
  res.redirect("https://discord.gg/J9HHRykY");
});
app.get("/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);
});*/

app.listen(PORT, () => {
  console.log(`Server listening requests on port ${PORT}`);
});