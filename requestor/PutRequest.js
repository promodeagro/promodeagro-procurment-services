const AWS = require("aws-sdk");
const { z } = require("zod");
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const { uuid } = event.pathParameters;
    const { items } = JSON.parse(event.body);

    const ItemSchema = z.object({
        itemName: z.string().min(3, { message: "Item name must be at least 3 characters long" }),
        category: z.string().min(3, { message: "Category name must be at least 3 characters long" }),
        units: z.string(),
        quantity: z.number(),
        price: z.number(),
        totalCost: z.number(),
    });
    const parsedItems = items.map(item => ({
        ...item,
        quantity: parseInt(item.quantity), 
        price: parseFloat(item.price.replace(/[^\d.]/g, '')), 
        totalCost: parseFloat(item.totalCost.replace(/[^\d.]/g, '')),
    }));

    const result = ItemSchema.safeParse({ items: parsedItems });

    if (!result.success) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                error: result.error.errors.map(err => err.message),
            }),
        };
    }

    const existingProjectParams = {
        TableName: "requestor",
        Key: {
            requestor_id: uuid,
        },
    };

    try {
        const existingProject = await dynamodb.get(existingProjectParams).promise();
        if (!existingProject.Item) {
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({
                    message: "Project not found",
                }),
            };
        }
        const updateParams = {
            TableName: "requestor",
            Key: {
                requestor_id: uuid,
            },
            UpdateExpression: "set #items = :items",
            ExpressionAttributeNames: {
                "#items": "items" 
            },
            ExpressionAttributeValues: {
                ":items": parsedItems,
            },
            ReturnValues: "ALL_NEW",
        };

        const updatedProject = await dynamodb.update(updateParams).promise();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(updatedProject.Attributes),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                message: "Error updating project",
                error: error.message,
            }),
        };
    }
};