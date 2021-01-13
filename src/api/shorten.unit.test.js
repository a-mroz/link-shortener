const { constructUrlDetails } = require("./shorten");

describe("constructing URL details", () => {
  it("generates URL details without expiration timestamp", () => {
    // given
    const body = {
      url: "http://www.example.com",
      expirationHours: 2,
    };

    // when
    const urlDetails = constructUrlDetails(body);

    // then
    expect(urlDetails.createdTimestamp).toBeTruthy();
    expect(urlDetails.fullUrl).toBe(body.url);
    expect(urlDetails.shortlink).toBeTruthy();

    const { expirationTimestamp } = urlDetails;
    expect(expirationTimestamp).toBeTruthy();
    expect(
      Date.parse(urlDetails.expirationTimestamp) > new Date()
    ).toBeTruthy();
  });

  it("generates URL details without expiration timestamp", () => {
    // given
    const body = {
      url: "http://www.example.com",
    };

    // when
    const urlDetails = constructUrlDetails(body);

    // then
    expect(urlDetails.expirationTimestamp).toBe("");
  });

  it("throws for missing URL", () => {
    // given
    const body = {};

    // when - then
    expect(() => constructUrlDetails(body)).toThrowError(/^\[400\]/);
  });

  // checking if URL is valid is done by JSON schema
  it("throws for malicious URL", () => {
    // given
    const body = {
      url: "javascript:alert(document.domain)",
    };

    // when - then
    expect(() => constructUrlDetails(body)).toThrowError(/^\[400\]/);
  });
});
