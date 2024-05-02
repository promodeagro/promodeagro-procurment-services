const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-west-1', endpoint: 'http://localhost:8000' });

exports.add_request = async (event, context, callback) => {
    event = JSON.parse(event.body);

    let objReturn = {
        code: 200,
        message: "Request added successfully",
        type: "object",
        object: []
    };

    try {
        if (!event || !event.details || !event.details.items || event.details.items.length === 0) {
            objReturn.code = 400;
            objReturn.message = "Invalid request. Please provide items.";
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify(objReturn)
            };
        } else {
            const params = {
                TableName: 'requestor',
                Item: {
                    requestor_id: event.details.id || Math.random().toString(36).substring(2), // Generating random ID if not provided
                    details: event.details
                }
            };

            await dynamodb.put(params).promise();
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(objReturn)
        };
    } catch (error) {
        console.error('Error:', error);
        objReturn.code = 500;
        objReturn.message = "An error occurred";
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(objReturn)
        };
    }
};
