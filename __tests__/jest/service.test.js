const {
  findOrCreateRoleWithName,
  updateGuideMessage,
  createInvitation,
  findCategoryWithCourseName,
  createCourseToDatabase,
  removeCourseFromDb,
  findChannelWithNameAndType,
  findChannelWithId,
  msToMinutesAndSeconds,
  findOrCreateChannel,
  setCoursePositionABC,
  isCourseCategory,
  getCourseNameFromCategory,
  findAllCourseNames } = require("../../src/discordBot/services/service");

const createGuidePinnedMessage = async (guild) => {
  const rows = courses
    .map((course) => {
      const code = course.code;
      const fullname = course.fullName;
      const count = guild.roles.cache.find(
        (role) => role.name === course.name,
      )?.members.size;
      return `  - ${code} - ${fullname} 👤${count}`;
    });

  let invite_url = "";
  process.env.NODE_ENV === "production" ? invite_url = `${process.env.BACKEND_SERVER_URL}` : invite_url = `${process.env.BACKEND_SERVER_URL}:${process.env.PORT}`;

  const newContent = `
Käytössäsi on seuraavia komentoja:
  - \`/join\` jolla voit liittyä kurssille
  - \`/leave\` jolla voit poistua kurssilta
Kirjoittamalla \`/join\` tai \`/leave\` botti antaa listan kursseista.

You have the following commands available:
  - \`/join\` which you can use to join a course
  - \`/leave\` which you can use to leave a course
The bot gives a list of the courses if you type \`/join\` or \`/leave\`.

Kurssit / Courses:
${rows.join("\n")}

In course specific channels you can also list instructors with the command \`/instructors\`

See more with \`/help\` command.

Invitation link for the server ${invite_url}
`;
  return newContent;
};

const courses = [{ code: "tkt", fullName: "test course", name: "test" }];

const Course = {
  create: jest.fn(),
  findOne: jest
    .fn(() => true)
    .mockImplementationOnce(() => false)
    .mockImplementationOnce(() => false),
  findAll: jest.fn(() => courses),
  destroy: jest.fn(),
};

const { client } = require("../mocks/mockSlashClient");

afterEach(() => {
  jest.clearAllMocks();
});

describe("Service", () => {
  test("Get course name from category name", () => {
    const courseString = "test";
    const categoryName = "📚 test";
    const result = getCourseNameFromCategory(categoryName);
    expect(result).toBe(courseString);
  });

  test("Get course name from privateCategory name", () => {
    const courseString = "test";
    const privateCategoryName = "👻 test";
    const result = getCourseNameFromCategory(privateCategoryName);
    expect(result).toBe(courseString);
  });

  test("Can create a new role", async () => {
    const roleName = "test";
    await findOrCreateRoleWithName(roleName, client.guild);
    expect(client.guild.roles.create).toHaveBeenCalledTimes(1);
    expect(client.guild.roles.cache.size).toBe(1);
  });

  test("Dublicated role cannot be created", async () => {
    const roleName = "test";
    await findOrCreateRoleWithName(roleName, client.guild);
    await findOrCreateRoleWithName(roleName, client.guild);
    expect(client.guild.roles.cache.size).toBe(1);
    expect(client.guild.roles.create).toHaveBeenCalledTimes(0);
  });

  test("dont find invalid channel with name and type", () => {
    const channelFound = findChannelWithNameAndType("guide", "GUILD_TEXT", client.guild);
    expect(channelFound).toBeUndefined();
  });

  test("find valid channel with name and type", () => {
    const channelObject = { name: "guide", options: { type: "GUILD_TEXT" } };
    client.guild.channels.create(channelObject.name, channelObject.options);
    const channelFound = findChannelWithNameAndType("guide", "GUILD_TEXT", client.guild);
    const result = { name: "guide", type: "GUILD_TEXT" };
    expect(channelFound).toMatchObject(result);
  });

  test("find valid channel with id", () => {
    const channel = { name: "guide", type: "GUILD_TEXT" };
    const channelFound = findChannelWithId(1, client.guild);
    expect(channelFound).toMatchObject(channel);
  });

  test("Update guide message", async () => {
    const role = { name: "test", members: [] };
    const guide = { id: 1, name: "guide", type: "GUILD_TEXT", send: jest.fn(() => msg) };
    const commands = { id: 2, name: "commands", type: "GUILD_TEXT", send: jest.fn(() => msg) };
    const testCategory = { id: 3, name: "📚 test", type: "GUILD_CATEGORY", members: {} };
    client.guild.invites.cache.push({ channel: { name: "guide", code: 1 } });
    client.guild.channels.cache = [guide, commands, testCategory];
    client.guild.roles.cache = [role];
    const msg = { guild: client.guild, pin: jest.fn(), edit: jest.fn() };
    const guideMessage = await createGuidePinnedMessage(client.guild, Course);
    await updateGuideMessage(msg, Course);
    expect(msg.edit).toHaveBeenCalledTimes(1);
    expect(msg.edit).toHaveBeenCalledWith(guideMessage);
    client.guild.channels.cache = [];
  });

  test("creating guide invitation call createInvite", async () => {
    const msg = { pin: jest.fn() };
    const invite = { code: 1 };
    const guide = { name: "guide", type: "GUILD_TEXT", createInvite: jest.fn(() => invite), send: jest.fn(() => msg) };
    client.guild.channels.cache = [guide];
    await createInvitation(client.guild, "guide");
    expect(guide.createInvite).toHaveBeenCalledTimes(1);
    expect(msg.pin).toHaveBeenCalledTimes(1);
    client.guild.channels.cache = [];
  });

  test("creating invitation not guide", async () => {
    const msg = { pin: jest.fn() };
    const invite = { code: 1 };
    const guide = { name: "guide", type: "GUILD_TEXT", createInvite: jest.fn(() => invite), send: jest.fn(() => msg) };
    client.guild.channels.cache = [guide];
    await createInvitation(client.guild, "test");
    expect(guide.createInvite).toHaveBeenCalledTimes(0);
    expect(msg.pin).toHaveBeenCalledTimes(1);
    client.guild.channels.cache = [];
  });

  test("find public category", () => {
    const courseString = "test";
    const pubCategoryName = "📚 test";
    const pubChan = { name: pubCategoryName, type: "GUILD_CATEGORY" };
    client.guild.channels.cache = [pubChan];

    const result = findCategoryWithCourseName(courseString, client.guild);
    expect(result.name).toBe(pubCategoryName);
    client.guild.channels.cache = [];
  });

  test("find private category", () => {
    const courseString = "test";
    const privCategoryName = "👻 test";
    const privChan = { name: privCategoryName, type: "GUILD_CATEGORY" };
    client.guild.channels.cache = [privChan];

    const result = findCategoryWithCourseName(courseString, client.guild);
    expect(result.name).toBe(privCategoryName);
    client.guild.channels.cache = [];
  });

  test("create new group", async () => {
    const courseCode = "tkt101";
    const courseFullName = "test course";
    const courseString = "test";
    await createCourseToDatabase(courseCode, courseFullName, courseString, Course);
    // expect(Course.create).toHaveBeenCalledTimes(1);
    expect(Course.create).toHaveBeenCalledWith({ code: courseCode, fullName: courseFullName, name: courseString, private: false });
  });

  test("remove group - if no group dont destroy", async () => {
    const courseString = "test";
    await removeCourseFromDb(courseString, Course);
    expect(Course.findOne).toHaveBeenCalledTimes(1);
    expect(Course.destroy).toHaveBeenCalledTimes(0);
  });

  test("remove group - if group then destroy", async () => {
    const courseString = "test";
    await removeCourseFromDb(courseString, Course);
    expect(Course.findOne).toHaveBeenCalledTimes(1);
    expect(Course.destroy).toHaveBeenCalledTimes(1);
  });

  test("change ms to dorrect mm:ss format", () => {
    const time = "5:05";
    const result = msToMinutesAndSeconds(305000);
    expect(time).toMatch(result);
  });

  test("create a new channel if it does not exist", async () => {
    client.guild.channels.init();
    const channelObject = { name: "test", options: { type: "GUILD_TEXT" } };
    const guild = client.guild;
    await findOrCreateChannel(channelObject, guild);
    expect(guild.channels.create).toHaveBeenCalledTimes(1);
    expect(guild.channels.create).toHaveBeenCalledWith(channelObject.name, channelObject.options);
  });

  test("Dont create a new channel if exists", async () => {
    const channelObject = { name: "test", options: { type: "GUILD_TEXT" } };
    const guild = client.guild;
    await findOrCreateChannel(channelObject, guild);
    expect(guild.channels.create).toHaveBeenCalledTimes(0);
  });

  test("setCourse positions", async () => {
    client.guild.channels.init();
    client.guild.channels.create("📚 testA", { type: "GUILD_CATEGORY" });
    const categoryA = client.guild.channels.cache.find(c => c.name === "📚 testA");
    setCoursePositionABC(client.guild, "📚 testA");
    expect(categoryA.edit).toHaveBeenCalledTimes(1);
  });

  test("valid private category is course category", async () => {
    const privateCategoryName = "🔒 test";
    const channel = { name: privateCategoryName };
    const result = isCourseCategory(channel);
    expect(result).toBe(true);
  });

  test("channel without emoji is not course category", async () => {
    const privateCategoryName = "test";
    const channel = { name: privateCategoryName };
    const result = isCourseCategory(channel);
    expect(result).toBe(false);
  });

  test("trimmer returs correct string public", async () => {
    const category = "test";
    const privateCategoryName = "📚 test";
    const channel = { name: privateCategoryName };
    const result = getCourseNameFromCategory(channel);
    expect(result).toBe(category);
  });

  test("trimmer returs correct string private", async () => {
    const category = "test";
    const privateCategoryName = "🔒 test";
    const channel = { name: privateCategoryName };
    const result = getCourseNameFromCategory(channel);
    expect(result).toBe(category);
  });

  test("find all channel names", async () => {
    client.guild.channels.init();
    const guild = client.guild;
    guild.channels.cache.set(1, { name: "🔒 test" });
    guild.channels.cache.set(2, { name: "testing" });
    const channelNames = ["test"];
    const result = findAllCourseNames(guild);
    expect(result).toStrictEqual(channelNames);
  });

  test("find all channel names", async () => {
    client.guild.channels.init();
    const guild = client.guild;
    guild.channels.cache.set(1, { name: "🔒 test" });
    guild.channels.cache.set(2, { name: "testing" });
    const channelNames = ["test"];
    const result = findAllCourseNames(guild);
    expect(result).toStrictEqual(channelNames);
  });
});
