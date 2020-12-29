"use strict";

exports.handler = async (event, context, callback) => {
  const body = JSON.parse(event["body"]);

  if (!body || !body.url) {
    throw "URL is required";
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify("Hello from Lambda!"),
  };
  return response;
};
