const encoder = require("./base58Encoder");

describe("Base58 Encoder", () => {
  it("should encode and decode properly", () => {
    // given
    const number = Math.floor(Math.random() * 1000);

    // when
    const result = encoder.decode(encoder.encode(number));

    // then
    expect(result).toBe(number);
  });
});
