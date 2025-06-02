import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  GetItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";

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
  await dynamo.send(
    new PutItemCommand({
      TableName: GROUP_CHATS_TABLE,
      Item: marshall(group),
    })
  );
  return group;
};


export const addMessageToChat = async (
  groupId: string,
  senderId: string,
  content: string
) => {
  const message = {
    groupId,
    'time stamp': new Date().toISOString(),
    senderId,
    content
  };

  await dynamo.send(
    new PutItemCommand({
      TableName: GROUP_MESSAGES_TABLE,
      Item: marshall(message),
    })
  );

   console.log("📦 Message to insert into DynamoDB:", message);
  await dynamo.send(
    new PutItemCommand({
      TableName: GROUP_MESSAGES_TABLE,
      Item: marshall(message),
    })
  );

  return message;
};

export const getChatMessages = async (groupId: string) => {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: GROUP_MESSAGES_TABLE,
      KeyConditionExpression: "groupId = :groupId",
      ExpressionAttributeValues: marshall({
        ":groupId": { S: groupId }
      }, { removeUndefinedValues: true }),
      ConsistentRead: true,
    })
  );

  return result.Items?.map((item) => unmarshall(item)) || [];
};


export const getGroupById = async (groupId: string) => {
  const result = await dynamo.send(
    new GetItemCommand({
      TableName: GROUP_CHATS_TABLE,
      Key: {
        groupId: { S: groupId },
      },
    })
  );

  return result.Item ? unmarshall(result.Item) : null;
};


export const getUserGroups = async (userId: string) => {
  const result = await dynamo.send(
    new ScanCommand({
      TableName: GROUP_CHATS_TABLE,
    })
  );

  return (result.Items || [])
    .map((item) => unmarshall(item))
    .filter((group) => group.members.includes(userId));
};


export const verifyUsersExist = async (emails: string[]): Promise<string[]> => {
  const invalid: string[] = [];

  for (const email of emails) {
    try {
      console.log(`🔍 Verifying email: ${email}`);
      const res = await dynamo.send(
        new GetItemCommand({
          TableName: USERS_TABLE,
          Key: {
            email: { S: email },
          },
        })
      );

      if (!res.Item) {
        console.warn(`❌ User not found in DB: ${email}`);
        invalid.push(email);
      }
    } catch (err: any) {
      console.error(`❌ Error checking user "${email}":`, err.message);
      invalid.push(email);
    }
  }

  return invalid;
};
