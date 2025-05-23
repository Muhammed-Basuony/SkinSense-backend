import { Request, Response } from "express";
import {
  DynamoDBClient,
  QueryCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { AuthRequest } from "../middleware/authMiddleware";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({ region: "eu-north-1" });
const NOTIFICATIONS_TABLE = "SkinSenseNotifications";

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(400).json({ error: "Missing user ID" });
      return;
    }

    const result = await client.send(
      new QueryCommand({
        TableName: NOTIFICATIONS_TABLE,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": { S: userId } },
      })
    );

    const notifications = result.Items?.map(item => unmarshall(item)) || [];
    res.status(200).json({ notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

export const markAsSeen = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { notificationId } = req.body;

    if (!userId || !notificationId) {
      res.status(400).json({ error: "Missing user ID or notification ID" });
      return;
    }

    await client.send(
      new UpdateItemCommand({
        TableName: NOTIFICATIONS_TABLE,
        Key: {
          userId: { S: userId },
          notificationId: { S: notificationId },
        },
        UpdateExpression: "SET seen = :s",
        ExpressionAttributeValues: {
          ":s": { BOOL: true },
        },
      })
    );

    res.status(200).json({ message: "Notification marked as seen" });
  } catch (err) {
    console.error("Error marking notification as seen:", err);
    res.status(500).json({ error: "Failed to update notification" });
  }
};
