// src/services/chatbotService.ts
import axios from "axios";
import { DynamoDBClient, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const TABLE_NAME = "ChatbotHistory";

// ✅ Replace with your deployed chatbot URL
const CHATBOT_API_URL = "https://flask-chatbot-api-production.up.railway.app/chat";

interface ChatbotResponse {
  reply: string;
}

export class ChatbotService {
  async askQuestion(userId: string, message: string): Promise<ChatbotResponse> {
    try {
      const aiRes = await axios.post<ChatbotResponse>(CHATBOT_API_URL, {
        message,
      });

      const response = aiRes.data;
      const timestamp = new Date().toISOString();

      // Save chat in DynamoDB
      const saveCommand = new PutItemCommand({
        TableName: TABLE_NAME,
        Item: {
          userId: { S: userId },
          timestamp: { S: timestamp },
          userMessage: { S: message },
          botResponse: { S: response.reply },
        },
      });

      await client.send(saveCommand);

      return response;
    } catch (error: any) {
      console.error("❌ Chatbot Error:", error.message);
      throw new Error("Chatbot service is unavailable");
    }
  }

  async getChatHistory(userId: string) {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": { S: userId },
      },
    });

    const result = await client.send(command);

    return (
      result.Items?.map((item) => ({
        timestamp: item.timestamp.S,
        userMessage: item.userMessage.S,
        botResponse: item.botResponse.S,
      })) || []
    );
  }
}


