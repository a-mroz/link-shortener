const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * Encodes 10-based int to a string version in given base (default = 62). Base must be between 10 and 64.
 * This is NOT RFC 4648 compatible encoder (no padding etc).
 *
 */
function encode(number, base = 62) {
  if (base <= 10 || base > 64) {
    throw "Incorrect `base`. Must be greater than 10 and less or equal to 64.";
  }

  const res = [];
  while (number > 0) {
    res.push(ALPHABET[number % base]);
    number = number / base;
  }
  return res.join("");
}

module.exports = { encode };
