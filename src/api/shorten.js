"use strict";

const dynamodb = require("serverless-dynamodb-client").doc;
const sanitizeUrl = require("@braintree/sanitize-url").sanitizeUrl;
const { encode } = require("./base58Encoder");

const { URLS_TABLE } = process.env;

const BLANK_URL = "about:blank";

exports.handler = async (event, context, callback) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

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

  await dynamodb
    .put({
      TableName: URLS_TABLE,
      Item: {
        shortlink,
        full_url: url,
        created_timestamp: date.toISOString(),
        expiration_timestamp: null,
      },
      ReturnConsumedCapacity: "TOTAL",
      ConditionExpression: "attribute_not_exists(shortlink)",
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ shortlink }),
  };
};

function generateShortlink(timestamp) {
  return encode(parseInt(timestamp.getTime() + "" + randomInt()));
}

function randomInt() {
  return Math.floor(Math.random() * 128);
}
