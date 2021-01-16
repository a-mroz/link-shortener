const urlDetailsDao = require("../services/urlDetailsDao");

jest.mock("../services/urlDetailsDao", () => ({
  save: jest.fn(),
  findByShortlink: jest.fn(),
}));

const { handler } = require("./expand");

describe("Expanding link", () => {
  beforeEach(() => {
    urlDetailsDao.save.mockReset();
    urlDetailsDao.findByShortlink.mockReset();
  });

  it("throws for missing shortlink", async () => {
    // given
    const emptyEvent = {};

    // when - then
    await expect(handler(emptyEvent)).rejects.toThrowError(/^\[400\]/);
  });

  it("redirects to url if found", async () => {
    // given
    const shortlink = "test";
    const fullUrl = "http://www.example.com";

    mockDatabaseFetch(fullUrl);

    // when
    const result = await handler(event(shortlink));

    // then
    expect(result.statusCode).toBe(302);
    expect(result.headers.Location).toBe(fullUrl);
  });

  it("returns 404 if not found", async () => {
    // when
    const result = await handler(event("notFound"));

    // then
    expect(result.statusCode).toBe(404);
  });

  it("returns 404 for expired link", async () => {
    // given
    const shortlink = "test";
    const fullUrl = "http://www.example.com";

    const expiredDate = new Date();
    expiredDate.setMinutes(new Date().getMinutes() - 1);

    mockDatabaseFetch(fullUrl, expiredDate);

    // when
    const result = await handler(event(shortlink));

    // then
    expect(result.statusCode).toBe(404);
  });
});

function event(shortlink) {
  return {
    pathParameters: {
      shortlink,
    },
  };
}

function mockDatabaseFetch(fullUrl, expirationTimestamp) {
  urlDetailsDao.findByShortlink.mockImplementation(() => {
    return {
      fullUrl,
      expirationTimestamp,
    };
  });
}
