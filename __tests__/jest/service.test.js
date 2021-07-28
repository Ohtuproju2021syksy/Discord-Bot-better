const {
  createCategoryName,
  createPrivateCategoryName,
  getRoleFromCategory,
  findOrCreateRoleWithName,
  updateFaculty,
  updateGuideMessage,
  createInvitation,
  findCategoryName,
  createNewGroup,
  removeGroup,
  findChannelWithNameAndType,
  findChannelWithId,
  msToMinutesAndSeconds } = require("../../src/discordBot/services/service");

const Groups = {
  create: jest.fn(),
  findOne: jest
    .fn(() => true)
    .mockImplementationOnce(() => false),
  destroy: jest.fn(),
};

const { client } = require("../mocks/mockSlashClient");

afterEach(() => {
  jest.clearAllMocks();
});

describe("Service", () => {
  test("Get category name from course name", () => {
    const courseString = "test";
    const categoryName = "📚 test";
    const result = createCategoryName(courseString);
    expect(result).toBe(categoryName);
  });

  test("Get private category name from course name", () => {
    const courseString = "test";
    const privateCategoryName = "🔒 test";
    const result = createPrivateCategoryName(courseString);
    expect(result).toBe(privateCategoryName);
  });

  test("Get course name from category name", () => {
    const courseString = "test";
    const categoryName = "📚 test";
    const result = getRoleFromCategory(categoryName);
    expect(result).toBe(courseString);
  });

  test("Get course name from privateCategory name", () => {
    const courseString = "test";
    const privateCategoryName = "🔒 test";
    const result = getRoleFromCategory(privateCategoryName);
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

  test("Update faculty", async () => {
    await updateFaculty(client.guild);
    expect(client.guild.roles.create).toHaveBeenCalledTimes(1);
  });


  test("dont find invalid channel with name and type", () => {
    const channelFound = findChannelWithNameAndType("guide", "text", client.guild);
    expect(channelFound).toBeUndefined();
  });

  test("find valid channel with name and type", () => {
    const channel = { name: "guide", type: "text" };
    client.guild.channels.create("guide", "text");
    const channelFound = findChannelWithNameAndType("guide", "text", client.guild);
    expect(channelFound).toMatchObject(channel);
  });

  test("find valid channel with id", () => {
    const channel = { name: "guide", type: "text" };
    const channelFound = findChannelWithId(1, client.guild);
    expect(channelFound).toMatchObject(channel);
  });

  test("Update guide message", async () => {
    const role = { name: "test", members: [] };
    const guide = { id: 1, name: "guide", type: "text", send: jest.fn(() => msg) };
    const commands = { id: 2, name: "commands", type: "text", send: jest.fn(() => msg) };
    const testCategory = { id: 3, name: "📚 test", type: "category", members: {} };
    client.guild.invites.cache.push({ channel: { name: "guide", code: 1 } });
    client.guild.channels.cache = [guide, commands, testCategory];
    client.guild.roles.cache = [role];
    const msg = { guild: client.guild, pin: jest.fn(), edit: jest.fn() };
    await updateGuideMessage(msg);
    expect(client.guild.fetchInvites).toHaveBeenCalledTimes(1);
    expect(msg.edit).toHaveBeenCalledTimes(1);
    client.guild.channels.cache = [];
  });

  test("creating guide invitation call createInvite", async () => {
    const msg = { pin: jest.fn() };
    const invite = { code: 1 };
    const guide = { name: "guide", type: "text", createInvite: jest.fn(() =>invite), send: jest.fn(() => msg) };
    client.guild.channels.cache = [guide];
    await createInvitation(client.guild, "guide");
    expect(guide.createInvite).toHaveBeenCalledTimes(1);
    expect(msg.pin).toHaveBeenCalledTimes(1);
    client.guild.channels.cache = [];
  });

  test("creating invitation not guide", async () => {
    const msg = { pin: jest.fn() };
    const invite = { code: 1 };
    const guide = { name: "guide", type: "text", createInvite: jest.fn(() =>invite), send: jest.fn(() => msg) };
    client.guild.channels.cache = [guide];
    await createInvitation(client.guild, "test");
    expect(guide.createInvite).toHaveBeenCalledTimes(0);
    expect(msg.pin).toHaveBeenCalledTimes(1);
    client.guild.channels.cache = [];
  });

  test("find public category name", () => {
    const courseString = "test";
    const pubCategoryName = "📚 test";
    const pubChan = { name: pubCategoryName, type: "category" };
    client.guild.channels.cache = [pubChan];

    const result = findCategoryName(courseString, client.guild);
    expect(result).toBe(pubCategoryName);
    client.guild.channels.cache = [];
  });

  test("find private category name", () => {
    const courseString = "test";
    const privCategoryName = "🔒 test";
    const privChan = { name: privCategoryName, type: "category" };
    client.guild.channels.cache = [privChan];

    const result = findCategoryName(courseString, client.guild);
    expect(result).toBe(privCategoryName);
    client.guild.channels.cache = [];
  });

  test("create new group", () => {
    const courseString = "test";
    const groupId = "987654321012";
    createNewGroup([courseString, groupId], Groups);
    expect(Groups.create).toHaveBeenCalledTimes(1);
    expect(Groups.create).toHaveBeenCalledWith({ groupId: groupId, course: courseString });
  });

  test("remove group - if no group dont destroy", () => {
    const courseString = "test";
    removeGroup(courseString, Groups);
    expect(Groups.findOne).toHaveBeenCalledTimes(1);
    expect(Groups.findOne).toHaveBeenCalledWith({ where: { course: courseString } });
    expect(Groups.destroy).toHaveBeenCalledTimes(0);
  });

  test("remove group - if group then destroy", async () => {
    const courseString = "test";
    await removeGroup(courseString, Groups);
    expect(Groups.findOne).toHaveBeenCalledTimes(1);
    expect(Groups.findOne).toHaveBeenCalledWith({ where: { course: courseString } });
    expect(Groups.destroy).toHaveBeenCalledTimes(1);
    expect(Groups.destroy).toHaveBeenCalledWith({ where: { course: courseString } });
  });

  test("change ms to dorrect mm:ss format", () => {
    const time = "5:05";
    const result = msToMinutesAndSeconds(305000);
    expect(time).toMatch(result);
  });
});