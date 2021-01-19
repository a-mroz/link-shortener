const { handler } = require("./shorten");

const urlDetailsDao = require("../services/urlDetailsDao");

jest.mock("../services/urlDetailsDao", () => ({
  save: jest.fn(),
  findByShortlink: jest.fn(),
}));

describe("constructing URL details", () => {
  beforeEach(() => {
    urlDetailsDao.save.mockReset();
    urlDetailsDao.findByShortlink.mockReset();
  });

  it("generates URL details without expiration timestamp", async () => {
    // given
    const body = {
      url: "http://www.example.com",
      expirationHours: 2,
    };

    // when
    const response = await handler({ body });

    // then
    expect(response.statusCode).toBe(200);
    const responseBody = JSON.parse(response.body);
    expect(responseBody.shortlink).toBeTruthy();
    expect(responseBody.expirationTimestamp).toBeTruthy();

    // and
    const saved = urlDetailsDao.save.mock.calls[0][0];

    expect(saved.createdTimestamp).toBeTruthy();
    expect(saved.fullUrl).toBe(body.url);
    expect(saved.shortlink).toBeTruthy();

    const { expirationTimestamp } = saved;
    expect(expirationTimestamp).toBeTruthy();
    expect(Date.parse(expirationTimestamp) > new Date()).toBeTruthy();
  });

  it("generates URL details without expiration timestamp", async () => {
    // given
    const body = {
      url: "http://www.example.com",
    };

    // when
    const response = await handler({ body });

    // then
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).expirationTimestamp).toBe("");

    expect(urlDetailsDao.save.mock.calls[0][0].expirationTimestamp).toBe("");
  });

  it("works for body as string", async () => {
    // given
    const body = {
      url: "http://www.example.com",
    };

    // when
    const response = await handler({ body: JSON.stringify(body) });

    // then
    expect(response.statusCode).toBe(200);
  });

  it("throws for missing URL", async () => {
    // given
    const body = {};

    // when - then
    await expect(handler({ body })).rejects.toThrowError(/^\[400\]/);
  });

  // checking if URL is valid is done by JSON schema
  it("throws for malicious URL", async () => {
    // given
    const body = {
      url: "javascript:alert(document.domain)",
    };

    // when - then
    await expect(handler(body)).rejects.toThrowError(/^\[400\]/);
  });
});
