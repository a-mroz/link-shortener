"use strict";

const dynamodb = require("serverless-dynamodb-client").doc;
const sanitizeUrl = require("@braintree/sanitize-url").sanitizeUrl;
const { encode } = require("./base58Encoder");

const { URLS_TABLE } = process.env;

const BLANK_URL = "about:blank";

exports.handler = async (event, context, callback) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  if (!event["body"]) {
    callback("URL is required");
  }

  const body =
    typeof event.body == "object" ? event.body : JSON.parse(event.body);

  const url = sanitizeUrl(body.url);

  if (!url || url === BLANK_URL) {
    callback("Valid URL is required");
  }

  const now = new Date();
  const shortlink = generateShortlink(now);

  const expirationTimestamp = expirationDate(body);
  // TODO analytics?
  await dynamodb
    .put({
      TableName: URLS_TABLE,
      Item: {
        shortlink,
        fullUrl: url,
        createdTimestamp: now.toISOString(),
        expirationTimestamp,
      },
      ReturnConsumedCapacity: "TOTAL",
      ConditionExpression: "attribute_not_exists(shortlink)",
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ shortlink, expirationTimestamp }),
  };
};

function generateShortlink(timestamp) {
  return encode(parseInt(timestamp.getTime() + "" + randomInt()));
}

function randomInt() {
  return Math.floor(Math.random() * 128);
}

function expirationDate(body) {
  const { expirationHours } = body;

  if (!expirationHours) {
    return "";
  }

  const expirationTimestamp = new Date();
  expirationTimestamp.setHours(
    expirationTimestamp.getHours() + expirationHours
  );

  return expirationTimestamp.toISOString();
}
