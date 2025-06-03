import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({ region: "eu-north-1" });
const NOTIFICATIONS_TABLE = "SkinSenseNotifications";

/**
 * Sends a new notification to a user.
 */
export const sendNotification = async (
  userId: string,
  type: "chat" | "article" | "update" | "scan",
  title: string,
  message: string
): Promise<void> => {
  const command = new PutItemCommand({
    TableName: NOTIFICATIONS_TABLE,
    Item: {
      userId: { S: userId },
      notificationId: { S: uuidv4() },
      type: { S: type },
      title: { S: title },
      message: { S: message },
      seen: { BOOL: false },
      timestamp: { S: new Date().toISOString() },
    },
  });

  await client.send(command);
};
