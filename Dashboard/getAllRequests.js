'use strict';

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({
  // region: 'localhost',
  // endpoint: 'http://localhost:8000'
});

module.exports.getAllRequests = async (event) => {
  try {
    const params = {
      TableName: 'requestor'
    };
    const result = await dynamoDB.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items)
    };
  } catch (error) {
    console.error('Error fetching requests:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not fetch requests' })
    };
  }
};
