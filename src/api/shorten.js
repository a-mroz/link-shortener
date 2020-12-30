"use strict";

const dynamodb = require("serverless-dynamodb-client").doc;

const { URLS_TABLE } = process.env;

exports.handler = async (event, context, callback) => {
  if (!event["body"]) {
    return callback("URL is required");
  }

  const body =
    typeof event.body == "object" ? event.body : JSON.parse(event.body);
  const { url } = body;

  if (!url) {
    return callback("URL is required");
  }

  const shortlink = shorten(url);

  dynamodb.put(
    {
      TableName: URLS_TABLE,
      Item: {
        shortlink,
        full_url: url,
        created_timestamp: new Date().toISOString(),
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
        console.log(data);

        const response = {
          statusCode: 200,
          body: JSON.stringify({ shortlink }),
        };
        return response;
      }
    }
  );
};

function shorten(url) {
  return "TODO";
}
