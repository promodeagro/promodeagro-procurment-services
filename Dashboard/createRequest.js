const AWS = require('aws-sdk');
//const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

// const dynamoDBConfig = {
//   region: 'localhost',
//   endpoint: 'http://localhost:8000'
// };
//const dynamoDBClient = new DynamoDBClient(dynamoDBConfig);

module.exports.createRequest = async (event) => {
  const dynamoDB = new AWS.DynamoDB.DocumentClient();
  const requestBody = JSON.parse(event.body);

  if (!Array.isArray(requestBody.item_list)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'item_list must be an array' })
    };
  }

  const params = {
    TableName: 'requestor',
    Item: {
      'request_id': requestBody.request_id, // Assuming request_id is part of the request body
      'delivery_date': requestBody.delivery_date,
      'department': requestBody.department,
      'location': requestBody.location,
      'priority': requestBody.priority,
      'notes': requestBody.notes,
      'status': requestBody.status,
      'item_list': requestBody.item_list.map(item => ({
        'line': item.line,
        'name': item.name,
        'category': item.category,
        'unit': item.unit,
        'quantity': item.quantity,
        'price': item.price,
        'totalCost': item.totalCost
      }))
    }
  };

  try {
    await dynamoDB.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Item added successfully' })
    };
  } catch (error) {
    console.error('Error adding item to DynamoDB:', error); // Log detailed error message
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not add item' })
    };
  }
};
