"use strict";

const dynamodb = require("serverless-dynamodb-client").doc;
const sanitizeUrl = require("@braintree/sanitize-url").sanitizeUrl;
const { encode } = require("../services/base58Encoder");

const { URLS_TABLE } = process.env;

const BLANK_URL = "about:blank";

const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const body = getBody(event);
  const urlDetails = constructUrlDetails(body);

  await dynamodb
    .put({
      TableName: URLS_TABLE,
      Item: urlDetails,
      ReturnConsumedCapacity: "TOTAL",
      ConditionExpression: "attribute_not_exists(shortlink)",
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      shortlink: urlDetails.shortlink,
      expirationTimestamp: urlDetails.expirationTimestamp,
    }),
  };
};

function getBody(event) {
  if (!event["body"]) {
    throw new Error("[400] URL is required");
  }

  return typeof event.body == "object" ? event.body : JSON.parse(event.body);
}

function constructUrlDetails(body) {
  const url = getUrl(body.url);

  const now = new Date();
  const expirationTimestamp = expirationDate(body.expirationHours);
  const shortlink = generateShortlink(now);

  // TODO analytics?
  const urlDetails = {
    shortlink,
    fullUrl: url,
    createdTimestamp: now.toISOString(),
    expirationTimestamp,
  };

  return urlDetails;
}

function getUrl(bodyUrl) {
  const url = sanitizeUrl(bodyUrl);

  if (!url || url === BLANK_URL) {
    throw new Error("[400] Valid URL is required");
  }
  return url;
}

function generateShortlink(timestamp) {
  return encode(parseInt(timestamp.getTime() + "" + randomInt()));
}

function randomInt() {
  return Math.floor(Math.random() * 128);
}

function expirationDate(expirationHours) {
  if (!expirationHours) {
    return "";
  }

  const expirationTimestamp = new Date();
  expirationTimestamp.setHours(
    expirationTimestamp.getHours() + expirationHours
  );

  return expirationTimestamp.toISOString();
}

exports.handler = handler;
exports.constructUrlDetails = constructUrlDetails;
