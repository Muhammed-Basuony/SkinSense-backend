import { DynamoDBClient, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({ region: "eu-north-1" });
const TABLE_NAME = "ChatHistory";

/**
 * Save a chat message to DynamoDB.
 * Supports optional imageUrl for image-based interactions.
 */
export const saveChatToDynamoDB = async (
  userId: string,
  question: string,
  reply: string,
  imageUrl?: string
) => {
  const timestamp = new Date().toISOString();

  const item: any = {
    userId: { S: userId },
    timestamp: { S: timestamp },
    question: { S: question },
    reply: { S: reply },
  };

  if (imageUrl) {
    item.imageUrl = { S: imageUrl };
  }

  const params = {
    TableName: TABLE_NAME,
    Item: item,
  };

  await client.send(new PutItemCommand(params));
};

/**
 * Retrieve chat history for a specific user.
 */
export const getChatHistoryFromDynamoDB = async (userId: string) => {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: {
      ":uid": { S: userId },
    },
  };

  const result = await client.send(new QueryCommand(params));
  return result.Items?.map((item) => unmarshall(item)) || [];
};
