const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.get_requestor_status_percentage = async (event, context, callback) => {
    let objReturn = {
        code: 200,
        message: "Retrieved requestor status percentages successfully",
        type: "object",
        object: {}
    };

    try {
        const params = {
            TableName: 'requestor'
        };

        console.log('Scanning DynamoDB table...');
        const data = await dynamodb.scan(params).promise();
        console.log('DynamoDB Scan Result:', data);

        if (!data.Items || data.Items.length === 0) {
            objReturn.code = 404;
            objReturn.message = "No requestors found";
            return {
                statusCode: objReturn.code,
                headers: {
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify(objReturn)
            };
        }

        let totalRequests = data.Items.length;
        let approvedRequests = 0;
        let rejectedRequests = 0;
        let pendingRequests = 0;

        data.Items.forEach(item => {
            console.log('Processing item:', item);
            const status = item.status && item.status.S;
            console.log('Item status:', status);
            switch (status) {
                case 'approved':
                    approvedRequests++;
                    break;
                case 'rejected':
                    rejectedRequests++;
                    break;
                case 'pending':
                    pendingRequests++;
                    break;
            }
        });

        console.log('Approved Requests:', approvedRequests);
        console.log('Rejected Requests:', rejectedRequests);
        console.log('Pending Requests:', pendingRequests);

        objReturn.object = {
            approvedPercentage: ((approvedRequests / totalRequests) * 100).toFixed(2),
            rejectedPercentage: ((rejectedRequests / totalRequests) * 100).toFixed(2),
            pendingPercentage: ((pendingRequests / totalRequests) * 100).toFixed(2)
        };

        console.log('Response:', objReturn);
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
            statusCode: objReturn.code,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(objReturn)
        };
    }
};