const dynamodb = require("serverless-dynamodb-client").doc;
const { URLS_TABLE } = process.env;

async function save(urlDetails) {
  return dynamodb
    .put({
      TableName: URLS_TABLE,
      Item: urlDetails,
      ReturnConsumedCapacity: "TOTAL",
      ConditionExpression: "attribute_not_exists(shortlink)",
    })
    .promise();
}

async function findByShortlink(shortlink) {
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

module.exports = {
  save,
  findByShortlink,
};
