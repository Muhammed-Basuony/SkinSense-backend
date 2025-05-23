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
      name: result.Item.name?.S || null,
      email: result.Item.email?.S || null,
      age: result.Item.age?.N ? Number(result.Item.age.N) : null,
      gender: result.Item.gender?.S || null,
      bloodType: result.Item.bloodType?.S || null,
      phone: result.Item.phone?.S || null,
      photoUrl: result.Item.photoUrl?.S || null,
      location: result.Item.latitude && result.Item.longitude ? {
        latitude: parseFloat(result.Item.latitude.N!),
        longitude: parseFloat(result.Item.longitude.N!),
        address: result.Item.address?.S || null,
      } : null,
    };
  }

  async updateProfile(userId: string, data: any) {
    const attributes: any = {};
    const updateExpressions: string[] = [];

    if (data.age !== undefined) {
      attributes[":age"] = { N: data.age.toString() };
      updateExpressions.push("age = :age");
    }
    if (data.gender !== undefined) {
      attributes[":gender"] = { S: data.gender };
      updateExpressions.push("gender = :gender");
    }
    if (data.bloodType !== undefined) {
      attributes[":bloodType"] = { S: data.bloodType };
      updateExpressions.push("bloodType = :bloodType");
    }
    if (data.phone !== undefined) {
      attributes[":phone"] = { S: data.phone };
      updateExpressions.push("phone = :phone");
    }
    if (data.photoUrl !== undefined) {
      attributes[":photoUrl"] = { S: data.photoUrl };
      updateExpressions.push("photoUrl = :photoUrl");
    }
    if (data.location?.latitude !== undefined && data.location?.longitude !== undefined) {
      attributes[":latitude"] = { N: data.location.latitude.toString() };
      attributes[":longitude"] = { N: data.location.longitude.toString() };
      updateExpressions.push("latitude = :latitude", "longitude = :longitude");
      if (data.location.address !== undefined) {
        attributes[":address"] = { S: data.location.address };
        updateExpressions.push("address = :address");
      }
    }

    const updateCommand = new UpdateItemCommand({
      TableName: USERS_TABLE,
      Key: { userId: { S: userId } },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeValues: attributes,
    });

    await client.send(updateCommand);
    return { success: true };
  }
}
