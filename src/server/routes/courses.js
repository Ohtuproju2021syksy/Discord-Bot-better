const router = require("express").Router();
const { findCoursesFromDb, findCourseFromDbById, createCourseToDatabase } = require("../../db/services/courseService");
const models = require("../../db/dbInit");
const { logError } = require("../../discordBot/services/logger");

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
    course ? res.json(course).status(200) : res.json({ error: "no user with this id" }).status(404);
  }
  catch (error) {
    logError(error);
  }
});

router.post("/", async (req, res) => {
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

module.exports = router;