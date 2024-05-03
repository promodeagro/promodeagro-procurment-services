const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const {uuid} = event.pathParameters;

    const params = {
        TableName: "requestor", 
        Key: {
            requestor_id: uuid,
        },
    };

    try {
        await dynamodb.delete(params).promise();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                message: "Item deleted successfully",
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                message: "Error deleting item from DynamoDB",
                error: error.message,
            }),
        };
    }
};
