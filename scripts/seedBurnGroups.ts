// scripts/seedBurnGroups.ts

import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({ region: "eu-north-1" });
const GROUP_CHATS_TABLE = "GroupChats";

const defaultGroups = [
  "First Burn Degree",
  "Second Burn Degree",
  "Third Burn Degree",
];

const seedDefaultGroups = async () => {
  for (const name of defaultGroups) {
    const group = {
      groupId: uuidv4(),
      name,
      members: [],
      createdAt: new Date().toISOString(),
    };

    const command = new PutItemCommand({
      TableName: GROUP_CHATS_TABLE,
      Item: marshall(group),
    });

    try {
      await client.send(command);
      console.log(`✅ Group created: ${name}`);
    } catch (err) {
      console.error(`❌ Failed to create group: ${name}`, err);
    }
  }
};

seedDefaultGroups();
