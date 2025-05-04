import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const USERS_TABLE = "SkinSenseUsers";

export class ProfileService {
  async getProfile(userId: string) {
    const command = new GetItemCommand({
      TableName: USERS_TABLE,
      Key: {
        userId: { S: userId },
      },
    });

    const result = await client.send(command);
    if (!result.Item) throw new Error("User not found");

    return {
      name: result.Item.name?.S,
      email: result.Item.email?.S,
      age: result.Item.age?.N,
      gender: result.Item.gender?.S,
      bloodType: result.Item.bloodType?.S,
      phone: result.Item.phone?.S,
      photoUrl: result.Item.photoUrl?.S,
      address: result.Item.address?.S,
    };
  }

  async updateProfile(userId: string, data: any) {
    const attributes = {
      ":age": { N: data.age?.toString() },
      ":gender": { S: data.gender || "" },
      ":bloodType": { S: data.bloodType || "" },
      ":phone": { S: data.phone || "" },
      ":photoUrl": { S: data.photoUrl || "" },
      ":address": { S: data.address || "" },
    };

    const updateCommand = new UpdateItemCommand({
      TableName: USERS_TABLE,
      Key: { userId: { S: userId } },
      UpdateExpression: `
        SET age = :age,
            gender = :gender,
            bloodType = :bloodType,
            phone = :phone,
            photoUrl = :photoUrl,
            address = :address`,
      ExpressionAttributeValues: attributes,
    });

    await client.send(updateCommand);
    return { success: true };
  }
}