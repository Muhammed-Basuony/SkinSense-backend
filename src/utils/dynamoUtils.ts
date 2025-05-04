

import { DynamoDBClient, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({ region: "eu-north-1" }); 

const TABLE_NAME = "ChatHistory"; 

export const saveChatToDynamoDB = async (userId: string, question: string, reply: string) => {
  const timestamp = Date.now().toString();

  const params = {
    TableName: TABLE_NAME,
    Item: {
      userId: { S: userId },
      timestamp: { N: timestamp },
      question: { S: question },
      reply: { S: reply },
    },
  };

  await client.send(new PutItemCommand(params));
};

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
