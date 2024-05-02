const AWS = require("aws-sdk");
// const { AWS } = require("@aws-sdk/client-sfn");
const { z } = require("zod");
const { v4: uuid } = require("uuid");
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { details } = JSON.parse(event.body);

  const detailsSchema = z.object({
    deliveryDate: z.coerce.date(),
    department: z
      .string()
      .min(3, {
        message: "Department name must be at least 3 characters long",
      }),
    location: z
      .string()
      .min(3, { message: "Location name must be at least 3 characters long" }),
    priority: z
      .string()
      .min(3, { message: "Priority name must be at least 3 characters long" }),
  });
  const result = detailsSchema.safeParse(details);
  if (!result.success) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: result.error.errors,
      }),
    };
  }

  try {
    const requestor = {
      requestor_id: uuid(),
      status: "pending",
      details: details,
      items: [],
    };

    await dynamodb
      .put({
        TableName: "requestor",
        Item: requestor,
      })
      .promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(requestor),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: error.message,
        error: error,
      }),
    };
  }
};
