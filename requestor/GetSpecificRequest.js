const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const {uuid}= event.pathParameters;

    const params = {
        TableName: "requestor",
        Key: {
            requestor_id: uuid,
        },
    };
    
    try {
        const data = await dynamodb.get(params).promise();
        if (!data.Item) {
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({
                    message: "Item not found",
                }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(data.Item),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                message: "Error fetching data from DynamoDB",
                error: error.message,
            }),
        };
    }
};
