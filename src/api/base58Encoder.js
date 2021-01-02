// full alphabet without 0, O, l, I
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";

const BASE = ALPHABET.length;

/**
 * Encodes 10-based int to a string version in Base58.
 * This is _NOT_ RFC 4648 compatible encoder (no padding etc).
 *
 */
function encode(number) {
  res = "";
  while (number > 0) {
    res = ALPHABET[number % BASE] + res;
    number = Math.floor(number / BASE);
  }

  return res;
}

/**
 * Decodes string representation of Base58 to 10-based integer.
 */
function decode(string_representation) {
  res = 0;
  multipier = BASE;

  for (let c of string_representation) {
    res = ALPHABET.indexOf(c) + res * BASE;
    multipier *= BASE;
  }
  return res;
}

module.exports = { encode, decode };
