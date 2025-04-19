// src/services/chatHistoryService.ts
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

export class ChatHistoryService {
  async getHistory(userId: string) {
    const params = {
      TableName: "ChatbotHistory",
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": { S: userId },
      },
    };

    const result = await client.send(new QueryCommand(params));

    return result.Items?.map(item => ({
      message: item.userMessage.S,
      reply: item.botResponse.S,
      timestamp: item.timestamp.S,
    })) || [];
  }
}
