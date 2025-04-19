// src/services/skinScanService.ts

import { DynamoDBClient, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

interface AIResponse {
  diagnosis: string;
  confidence: number;
  recommendations: string;
}

export class SkinScanService {
  async saveScan(userId: string, scanData: { imageUrl: string }) {
    const scanId = uuidv4();
    const timestamp = new Date().toISOString();

    try {
      // Step 1: Call the AI Flask API
      const aiApiUrl = "https://flask-ai-api-production.up.railway.app/analyze";
 // Replace with your deployed Flask API URL
      const response = await axios.post<AIResponse>(aiApiUrl, {
        imageUrl: scanData.imageUrl,
      });

      const aiResult = response.data;

      const item = {
        userId: { S: userId },
        scanId: { S: scanId },
        timestamp: { S: timestamp },
        data: {
          S: JSON.stringify({
            imageUrl: scanData.imageUrl,
            diagnosis: aiResult.diagnosis,
            confidence: aiResult.confidence,
            recommendations: aiResult.recommendations,
          }),
        },
      };

      await client.send(new PutItemCommand({ TableName: "SkinScans", Item: item }));

      return {
        scanId,
        timestamp,
        ...JSON.parse(item.data.S!),
      };
    } catch (err: any) {
      console.error("🔥 Save Scan Error:", err);
      console.error("🔥 Stack Trace:", err.stack);

      const errorMessage =
        err?.response?.data?.error ||
        err?.message ||
        "Unknown error occurred while communicating with the AI service";

      throw new Error(errorMessage);
    }
  }

  async getScans(userId: string) {
    const params = {
      TableName: "SkinScans",
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": { S: userId },
      },
    };

    const result = await client.send(new QueryCommand(params));

    return (
      result.Items?.map((item) => ({
        scanId: item.scanId.S,
        timestamp: item.timestamp.S,
        data: JSON.parse(item.data.S!),
      })) || []
    );
  }
}


