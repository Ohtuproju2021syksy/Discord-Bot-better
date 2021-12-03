const router = require("express").Router();
const models = require("../../db/dbInit");
const { findChannelsFromDb, findChannelsByCourse, findChannelFromDbById, createChannelToDatabase, removeChannelFromDb } = require("../../db/services/channelService");
const { findCourseFromDbById } = require("../../db/services/courseService");
const { logError } = require("../../discordBot/services/logger");

router.get("/", async (req, res) => {
  try {
    const channels = await findChannelsFromDb(models.Channel);
    res.json(channels).status(200);
  }
  catch (error) {
    logError(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const channel = await findChannelFromDbById(req.params.id, models.Channel);
    channel ? res.json(channel).status(200) : res.status(404).end();
  }
  catch (error) {
    logError(error);
  }
});

router.get("/ofCourse/:id", async (req, res) => {
  try {
    const channels = await findChannelsByCourse(req.params.id, models.Channel);
    channels ? res.json(channels).status(200) : res.status(404).end();
  }
  catch (error) {
    logError(error);
  }
});

router.post("/:id", async (req, res) => {
  try {
    const course = await findCourseFromDbById(req.params.id, models.Course);

    const newChannel = await createChannelToDatabase({ courseId: course.id, name: req.body.name }, models.Channel);
    res.json(newChannel).status(201);
  }
  catch (error) {
    logError(error);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const channel = await findChannelFromDbById(req.params.id, models.Channel);
    channel.name = req.body.name;
    channel.topic = req.body.topic;
    channel.bridged = req.body.bridged;
    await channel.save();
    res.json(channel).status(200);
  }
  catch (error) {
    logError(error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const channel = await findChannelFromDbById(req.params.id, models.Channel);
    if (channel.defaultChannel) {
      res.status(405).end();
    }
    await removeChannelFromDb(req.body.name, models.Channel);
    res.status(204).end();
  }
  catch (error) {
    logError(error);
  }
});

module.exports = router;
