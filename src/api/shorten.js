"use strict";

const dynamodb = require("serverless-dynamodb-client").doc;
const sanitizeUrl = require("@braintree/sanitize-url").sanitizeUrl;

const { URLS_TABLE } = process.env;

const BLANK_URL = "about:blank";

exports.handler = async (event, context, callback) => {
  if (!event["body"]) {
    return callback("URL is required");
  }

  const body =
    typeof event.body == "object" ? event.body : JSON.parse(event.body);

  const url = sanitizeUrl(body.url);

  if (!url || url === BLANK_URL) {
    return callback("Valid URL is required");
  }

  const date = new Date();
  const shortlink = generateShortlink(date);

  dynamodb.put(
    {
      TableName: URLS_TABLE,
      Item: {
        shortlink,
        full_url: url,
        created_timestamp: date.toISOString(),
        expiration_timestamp: null,
      },
      ReturnConsumedCapacity: "TOTAL",
      ConditionExpression: "attribute_not_exists(shortlink)",
    },
    (error, data) => {
      if (error) {
        console.error("Error saving shortened link", error);
        return callback(error);
      } else {
        console.log(shortlink);

        const response = {
          statusCode: 200,
          body: JSON.stringify({ shortlink }),
        };
        return response;
      }
    }
  );
};

const ALPHABET =
  "abcdefghijklmnopqrstuwvxyzABCDEFGHIJLKMNOPQRSTUWVXYZ0123456789";

function generateShortlink(timestamp) {
  return convert(parseInt(timestamp.getTime() + "" + randomInt()));
}

function convert(number, base = 62) {
  // TODO check 10 < base <= 62, move to a separate service
  const res = [];
  while (number > 0) {
    res.push(ALPHABET[number % base]);
    number = number / base;
  }
  return res.join("");
}

function randomInt() {
  return Math.floor(Math.random() * 1024);
}
