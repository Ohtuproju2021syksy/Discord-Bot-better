const { updateGuide, findCategoryName, removeCourseFromDb } = require("../../services/service");
const { sendEphemeral } = require("../utils");
const { courseAdminRole } = require("../../../../config.json");

/*
const printCourses = async () => {
  const courses = await Course.findAll();
  console.log("All courses in db:", JSON.stringify(courses, null, 2));
};
*/
const execute = async (interaction, client, Course) => {
  const courseName = interaction.data.options[0].value.toLowerCase().trim();

  const guild = client.guild;

  const courseString = findCategoryName(courseName, guild);
  const category = guild.channels.cache.find(c => c.type === "category" && c.name === courseString);

  if (!category) return sendEphemeral(client, interaction, `Invalid course name: ${courseName}.`);
  await Promise.all(guild.channels.cache
    .filter(c => c.parent === category)
    .map(async channel => await channel.delete()),
  );

  await category.delete();

  await Promise.all(guild.roles.cache
    .filter(r => (r.name === `${courseName} ${courseAdminRole}` || r.name === courseName))
    .map(async role => await role.delete()),
  );
  sendEphemeral(client, interaction, `Deleted course ${courseName}.`);

  // Database
  await removeCourseFromDb(courseName, Course);
  // await printCourses();

  await client.emit("COURSES_CHANGED", Course);
  await updateGuide(client.guild, Course);

};

module.exports = {
  name: "remove",
  description: "Delete course.",
  usage: "[course name]",
  role: "admin",
  options: [
    {
      name: "course",
      description: "Course to delete.",
      type: 3,
      required: true,
    },
  ],
  execute,
};
