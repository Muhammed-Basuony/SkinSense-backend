import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamo = new DynamoDBClient({ region: "eu-north-1" });
const GROUP_CHATS_TABLE = "GroupChats";

const DEFAULT_GROUP_NAMES = [
  "First Burn Degree",
  "Second Burn Degree",
  "Third Burn Degree",
];

const getGroupByName = async (name: string) => {
  const command = new ScanCommand({
    TableName: GROUP_CHATS_TABLE,
    FilterExpression: "#name = :n",
    ExpressionAttributeNames: { "#name": "name" },
    ExpressionAttributeValues: { ":n": { S: name } },
  });

  const result = await dynamo.send(command);
  return result.Items?.[0];
};

export const addUserToDefaultGroups = async (userId: string) => {
  for (const groupName of DEFAULT_GROUP_NAMES) {
    const groupRaw = await getGroupByName(groupName);
    if (!groupRaw) {
      console.warn(`⚠️ Group '${groupName}' not found`);
      continue;
    }

    const group = unmarshall(groupRaw);
    const members: string[] = group.members || [];

    if (!members.includes(userId)) {
      members.push(userId);
      group.members = members;

      await dynamo.send(new PutItemCommand({
        TableName: GROUP_CHATS_TABLE,
        Item: marshall(group),
      }));

      console.log(`✅ Added ${userId} to ${groupName}`);
    }
  }
};
