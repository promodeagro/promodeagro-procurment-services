const AWS = require('aws-sdk');
//const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

// const dynamoDBConfig = {
//   region: 'localhost',
//   endpoint: 'http://localhost:8000'
// };
// const dynamoDBClient = new DynamoDBClient(dynamoDBConfig);

module.exports.getRejectedRequests = async (event) => {
  const dynamoDB = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: 'requestor',
    FilterExpression: '#status = :status',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': 'rejected'
    }
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items)
    };
  } catch (error) {
    console.error('Error fetching rejected requests:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not fetch rejected requests' })
    };
  }
};
