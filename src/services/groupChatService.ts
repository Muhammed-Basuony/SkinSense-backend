import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamo = new DynamoDBClient({ region: "eu-north-1" });
const GROUP_CHATS_TABLE = "GroupChats";
const GROUP_MESSAGES_TABLE = "GroupMessages";

export const createGroupChat = async (group: {
  groupId: string;
  name: string;
  members: string[];
  createdAt: string;
  photoUrl?: string;
}) => {
  const cmd = new PutItemCommand({
    TableName: GROUP_CHATS_TABLE,
    Item: marshall(group),
  });
  await dynamo.send(cmd);
  return group;
};

export const addMessageToChat = async (
  groupId: string,
  senderId: string,
  content: string
) => {
  const timestamp = new Date().toISOString();
  const message = {
    groupId,
    timestamp,
    senderId,
    content,
  };

  const cmd = new PutItemCommand({
    TableName: GROUP_MESSAGES_TABLE,
    Item: marshall(message),
  });

  await dynamo.send(cmd);
  return message;
};

export const getChatMessages = async (groupId: string) => {
  const cmd = new QueryCommand({
    TableName: GROUP_MESSAGES_TABLE,
    KeyConditionExpression: "groupId = :groupId",
    ExpressionAttributeValues: {
      ":groupId": { S: groupId },
    },
    ScanIndexForward: true,
  });

  const result = await dynamo.send(cmd);
  return result.Items?.map((item) => unmarshall(item)) || [];
};

export const getGroupById = async (groupId: string) => {
  const cmd = new GetItemCommand({
    TableName: GROUP_CHATS_TABLE,
    Key: {
      groupId: { S: groupId },
    },
  });

  const result = await dynamo.send(cmd);
  if (!result.Item) {
    throw new Error("Group not found");
  }

  return unmarshall(result.Item);
};
