import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";
import { User } from "../models/User.models";

const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION });
const USERS_TABLE = "SkinSenseUsers";

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const cmd = new GetItemCommand({
    TableName: USERS_TABLE,
    Key: {
      email: { S: email }
    },
  });

  const res = await dynamo.send(cmd);
  return res.Item ? (unmarshall(res.Item) as User) : null;
};

export const updateUserProfile = async (
  email: string,
  updates: Partial<User>
): Promise<User> => {
  const existing = await getUserByEmail(email);
  if (!existing) throw new Error("User not found");

  const mergedUser = { ...existing, ...updates };

  const cleanedUser: Partial<User> = {};
  (Object.keys(mergedUser) as (keyof User)[]).forEach((key) => {
    const value = mergedUser[key];
    if (value !== undefined && value !== null) {
      (cleanedUser as any) [key] = value as any;
    }
  });

  const putCmd = new PutItemCommand({
    TableName: USERS_TABLE,
    Item: marshall(cleanedUser),
  });

  await dynamo.send(putCmd);
  return cleanedUser as User;
};
