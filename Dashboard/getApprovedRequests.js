const AWS = require('aws-sdk');
//const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

module.exports.getApprovedRequests = async (event) => {
  const dynamoDB = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: 'requestor',
    FilterExpression: '#status = :status',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': 'approved'
    }
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items)
    };
  } catch (error) {
    console.error('Error fetching approved requests:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not fetch approved requests' })
    };
  }
};
