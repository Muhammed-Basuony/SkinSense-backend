import { generateToken } from "../utils/jwt";
import { DynamoDBClient, PutItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import bcrypt from "bcryptjs";
import { User, generateUserId } from "../models/User.models";

const dynamo = new DynamoDBClient({ region: "eu-north-1" });
const USERS_TABLE = "SkinSenseUsers";

export class AuthService {
  async signup(data: { name: string; email: string; password: string }) {
    const { name, email, password } = data;

    const existing = await this.getUserByEmail(email);
    if (existing) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateUserId();

    const newUser: User = {
      userId,
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    const putCommand = new PutItemCommand({
      TableName: USERS_TABLE,
      Item: {
        userId: { S: newUser.userId },
        name: { S: newUser.name },
        email: { S: newUser.email },
        password: { S: newUser.password },
        createdAt: { S: newUser.createdAt },
      },
    });

    await dynamo.send(putCommand);

    const token = generateToken({ userId, email });

    return {
      token,
      userId: newUser.userId,
      email: newUser.email,
      name: newUser.name,
    };
  }

  async login(data: { email: string; password: string }) {
    const { email, password } = data;
    const user = await this.getUserByEmail(email);
    if (!user) throw new Error("Invalid email or password");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid email or password");

    const token = generateToken({
      userId: user.userId,
      email: user.email,
    });

    return {
      token,
      userId: user.userId,
      email: user.email,
      name: user.name,
    };
  }

  async resetPassword(data: { email: string; newPassword: string }) {
    return "Feature coming soon";
  }

  private async getUserByEmail(email: string): Promise<User | null> {
    const getCommand = new GetItemCommand({
      TableName: USERS_TABLE,
      Key: {
        email: { S: email },
      },
    });

    const response = await dynamo.send(getCommand);
    if (!response.Item) return null;

    return {
      userId: response.Item.userId.S!,
      name: response.Item.name.S!,
      email: response.Item.email.S!,
      password: response.Item.password.S!,
      createdAt: response.Item.createdAt.S!,
    };
  }
}
