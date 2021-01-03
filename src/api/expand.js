"use strict";
const dynamodb = require("serverless-dynamodb-client").doc;
const { URLS_TABLE } = process.env;

exports.handler = async (event, context, callback) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  if (!event.pathParameters) {
    return callback("Invalid shortlink");
  }

  const { shortlink } = event.pathParameters;

  if (!shortlink) {
    callback("Invalid shortlink");
  }

  const items = await dynamodb
    .get({
      TableName: URLS_TABLE,
      Key: {
        shortlink,
      },
      ProjectionExpression: "shortlink,full_url,expiration_timestamp",
    })
    .promise();

  const urlDetails = items.Item;

  console.log(urlDetails);

  if (!urlDetails) {
    return {
      statusCode: 404,
    };
  }

  return {
    statusCode: 302,
    headers: {
      Location: urlDetails.full_url,
    },
  };
};
