require("dotenv").config();
const router = require("express").Router();
const { findCoursesFromDb, findCourseFromDbById, createCourseToDatabase, removeCourseFromDb } = require("../../db/services/courseService");
const models = require("../../db/dbInit");
const { logError } = require("../../discordBot/services/logger");
const jwt = require("jsonwebtoken");

const verifyRequest = (req) => {
  const token = req.get("authorization");
  if (!token) {
    return false;
  }
  const decodedToken = jwt.verify(token, process.env.API_SECRET);
  if (!decodedToken.username) {
    return false;
  }
  return true;
};

router.get("/", async (req, res) => {
  try {
    const courses = await findCoursesFromDb("id", models.Course, false);
    res.json(courses).status(200);
  }
  catch (error) {
    logError(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const course = await findCourseFromDbById(req.params.id, models.Course);
    course ? res.json(course).status(200) : res.status(404).end();
  }
  catch (error) {
    logError(error);
  }
});

router.post("/", async (req, res) => {
  if (!verifyRequest(req)) {
    return res.status(401).json({ error: "token missing or invalid" });
  }

  try {
    const courseCode = req.body.courseCode;
    const fullName = req.body.fullName;
    const name = req.body.name;

    const createdCourse = await createCourseToDatabase(courseCode, fullName, name, models.Course);
    res.json(createdCourse).status(200);
  }
  catch (error) {
    logError(error);
  }
});

router.put("/:id", async (req, res) => {
  if (!verifyRequest(req)) {
    return res.status(401).json({ error: "token missing or invalid" });
  }

  try {
    const course = await findCourseFromDbById(req.params.id, models.Course);
    course.code = req.body.code ? req.body.code : course.code;
    course.fullName = req.body.fullName ? req.body.fullName : course.fullName;
    course.name = req.body.name ? req.body.name : course.name;
    course.locked = req.body.locked ? req.body.locked : course.locked;
    course.private = req.body.private ? req.body.private : course.private;
    await course.save();
    res.json(course).status(200);
  }
  catch (error) {
    logError(error);
  }
});

router.delete("/:id", async (req, res) => {
  if (!verifyRequest(req)) {
    return res.status(401).json({ error: "token missing or invalid" });
  }

  try {
    const { name } = req.body;
    await removeCourseFromDb(name, models.Course);
    res.status(204).end();
  }
  catch (error) {
    logError(error);
  }
});

module.exports = router;