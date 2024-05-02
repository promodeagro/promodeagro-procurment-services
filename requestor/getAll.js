const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-west-1', endpoint: 'http://localhost:8000' });

exports.get_all_requestors = async (event, context, callback) => {
    let objReturn = {
        code: 200,
        message: "Retrieved all requestors successfully",
        type: "object",
        object: []
    };

    try {
        const params = {
            TableName: 'requestor'
        };

        const data = await dynamodb.scan(params).promise();

        if (data.Items.length === 0) {
            objReturn.code = 404;
            objReturn.message = "No requestors found";
        } else {
            objReturn.object = data.Items;
        }

        return {
            statusCode: objReturn.code,
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
