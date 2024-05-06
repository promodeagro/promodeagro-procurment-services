const AWS = require("aws-sdk");
// const { AWS } = require("@aws-sdk/client-sfn");
const { z } = require("zod");
const { v4: uuid } = require("uuid");
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { details, items } = JSON.parse(event.body);

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
  const itemSchema = z.array(
    z.object({
      itemName: z
        .string()
        .min(3, { message: "Item name must be at least 3 characters long" }),
      category: z
        .string()
        .min(3, {
          message: "Category name must be at least 3 characters long",
        }),
      units: z.string(),
      quantity: z.string(),
      price: z.string(),
      totalCost: z.string(),
    })
  );
  const detailsResult = detailsSchema.safeParse(details);
  const itemResult = itemSchema.safeParse(items);
  if (!detailsResult.success || !itemResult.success) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: [...detailsResult.error.errors, ...itemResult.error.errors],
      }),
    };
  }

  try {
    const requestor = {
      requestor_id: uuid(),
      status: "approved",
      details: details,
      items: itemResult.data,
    };

    requestor.items = requestor.items.map((item) => ({
      itemName: item.itemName,
      category: item.category,
      units: item.units,
      quantity: item.quantity,
      price: item.price.replace("rs.", "rs."),
      totalCost: item.totalCost.replace("rs.", "rs."),
    }));

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