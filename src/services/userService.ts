import {
  BatchGetItemCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "eu-north-1" });
const USERS_TABLE = "SkinSenseUsers";

/**
 * Verifies that all user IDs exist in the SkinSenseUsers table.
 */
export const verifyUsersExist = async (userIds: string[]): Promise<boolean> => {
  const keys = userIds.map((id) => ({ userId: { S: id } }));

  const command = new BatchGetItemCommand({
    RequestItems: {
      [USERS_TABLE]: {
        Keys: keys,
        ProjectionExpression: "userId",
      },
    },
  });

  const response = await client.send(command);
  const foundUsers = response.Responses?.[USERS_TABLE] || [];

  return foundUsers.length === userIds.length;
};
