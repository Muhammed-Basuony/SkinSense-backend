import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  GetItemCommand,
  ScanCommand
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamo = new DynamoDBClient({ region: "eu-north-1" });

const GROUP_CHATS_TABLE = "GroupChats";
const GROUP_MESSAGES_TABLE = "GroupMessages";
const USERS_TABLE = "SkinSenseUsers";

export const createGroupChat = async (group: {
  groupId: string;
  name: string;
  members: string[];
  createdAt: string;
}) => {
  await dynamo.send(new PutItemCommand({
    TableName: GROUP_CHATS_TABLE,
    Item: marshall(group),
  }));
  return group;
};

export const addMessageToChat = async (
  groupId: string,
  senderId: string,
  content: string
) => {
  const timestamp = new Date().toISOString();
  const message = { groupId, timestamp, senderId, content };

  await dynamo.send(new PutItemCommand({
    TableName: GROUP_MESSAGES_TABLE,
    Item: marshall(message),
  }));

  return message;
};

export const getChatMessages = async (groupId: string) => {
  const result = await dynamo.send(new QueryCommand({
    TableName: GROUP_MESSAGES_TABLE,
    KeyConditionExpression: "groupId = :groupId",
    ExpressionAttributeValues: {
      ":groupId": { S: groupId },
    },
    ScanIndexForward: true,
  }));

  return result.Items?.map(item => unmarshall(item)) || [];
};

export const getGroupById = async (groupId: string) => {
  const result = await dynamo.send(new GetItemCommand({
    TableName: GROUP_CHATS_TABLE,
    Key: {
      groupId: { S: groupId },
    },
  }));

  if (!result.Item) throw new Error("Group not found");
  return unmarshall(result.Item);
};

export const getUserGroups = async (userId: string) => {
  const result = await dynamo.send(new ScanCommand({
    TableName: GROUP_CHATS_TABLE,
  }));

  return (result.Items || [])
    .map(item => unmarshall(item))
    .filter(group => group.members.includes(userId));
};

export const verifyUsersExist = async (userIds: string[]): Promise<string[]> => {
  const invalid: string[] = [];

  for (const userId of userIds) {
    const res = await dynamo.send(new GetItemCommand({
      TableName: USERS_TABLE,
      Key: { userId: { S: userId } },
    }));
    if (!res.Item) invalid.push(userId);
  }

  return invalid;
};
