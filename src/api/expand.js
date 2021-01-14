"use strict";

const urlDetailsDao = require("../services/urlDetailsDao");
const get = require("lodash/get");

exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const shortlink = extractShortlink(event);

  const urlDetails = await urlDetailsDao.findByShortlink(shortlink);
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

// This should be removed by Dynamo TTL feature, but just in case
function isUrlExpired(urlDetails) {
  const { expirationTimestamp } = urlDetails;

  return expirationTimestamp
    ? Date.parse(expirationTimestamp) < new Date()
    : false;
}
