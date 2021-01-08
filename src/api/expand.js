"use strict";
const dynamodb = require("serverless-dynamodb-client").doc;
const { URLS_TABLE } = process.env;
const get = require("lodash/get");

exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const shortlink = extractShortlink(event);

  const urlDetails = await fetchUrlDetails(shortlink);
  console.log(urlDetails);

  if (!urlDetails || isUrlExpired(urlDetails)) {
    return {
      statusCode: 404,
    };
  }

  return {
    statusCode: 302,
    headers: {
      Location: urlDetails.fullUrl,
    },
  };
};

function extractShortlink(event) {
  const shortlink = get(event, "pathParameters.shortlink");

  if (!shortlink) {
    throw new Error("[400] Invalid shortlink");
  }

  return shortlink;
}

async function fetchUrlDetails(shortlink) {
  const items = await dynamodb
    .get({
      TableName: URLS_TABLE,
      Key: {
        shortlink,
      },

      ProjectionExpression: "shortlink,fullUrl,expirationTimestamp",
    })
    .promise();

  return items.Item;
}

// This should be removed by Dynamo TTL feature, but just in case
function isUrlExpired(urlDetails) {
  const { expirationTimestamp } = urlDetails;

  return expirationTimestamp
    ? Date.parse(expirationTimestamp) < new Date()
    : false;
}
