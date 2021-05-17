require("dotenv").config();
const Discord = require("discord.js");
const { createCourse } = require("./courses");
const { addRole, removeRole } = require("./roles");
const printInstructors = require("./printInstructors");
const printCourses = require("./printCourses");
const printHelp = require("./printHelp");
const updateGuide = require("./updateGuide");
const updateFaculty = require("./updateFaculty");
const { context, initializeApplicationContext } = require("./util");
const client = new Discord.Client();
const BOT_TOKEN = process.env.BOT_TOKEN;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  initializeApplicationContext(client);
});

const JOIN_COURSE_MESSAGE = "!join";
const LEAVE_COURSE_MESSAGE = "!leave";
const HELP_MESSAGE = "!help";
const COURSES_MESSAGE = "!courses";
const PRINT_INSTRUCTORS_MESSAGE = "!instructors";
const INITIALIZE_COURSE_MESSAGE = "!init";
const UPDATE_GUIDE_MANUALLY = "!update_guide";

/**
 * 
 * @param {String} action 
 * @param {String} courseString 
 * @param {Discord.Message} msg 
 */
const handleCommand = async (action, courseString, msg) => {
  const who = msg.member;

  if (action === PRINT_INSTRUCTORS_MESSAGE) return printInstructors(msg);

  if (msg.channel.id !== context.commands.id && msg.channel.name !== 'test'){
    msg.reply(`Please message me in <#${context.commands.id}> channel!`)
    throw new Error('Command outside of commands channel')
  } 

  switch (action) {
    case JOIN_COURSE_MESSAGE:
      const roleAdded = await addRole(who, courseString);
      updateGuide();
      return roleAdded;
    case LEAVE_COURSE_MESSAGE:
      const roleRemoved = await removeRole(who, courseString);
      updateGuide();
      return roleRemoved;
    case PRINT_INSTRUCTORS_MESSAGE:
      return printInstructors(msg);
    case HELP_MESSAGE:
      return printHelp(msg);
    case COURSES_MESSAGE:
      return printCourses(msg);
    case INITIALIZE_COURSE_MESSAGE:
      const courseCreated = await createCourse(who, courseString);
      updateGuide();
      return courseCreated;
    case UPDATE_GUIDE_MANUALLY:
      updateFaculty();
      return updateGuide();
    default:
      return;
  }
};

client.on("message", async (msg) => {
  if (msg.content.startsWith("!") && context.ready) {
    const [action, ...args] = msg.content.split(" ");
    const courseString = args.join(" ");
    try {
      await handleCommand(action, courseString, msg);
      await msg.react("✅");
    } catch (err) {
      console.log(err);
      await msg.react("❌");
    }
  }
});

client.login(BOT_TOKEN);
