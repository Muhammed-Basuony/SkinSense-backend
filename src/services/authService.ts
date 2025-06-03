import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendVerificationCodeEmail } from "../utils/emailService";
import { User, generateUserId } from "../models/User.models";

dotenv.config();

const dynamo = new DynamoDBClient({ region: "eu-north-1" });
const USERS_TABLE = "SkinSenseUsers";
const CODES_TABLE = "SkinSenseResetCodes";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret";

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
      age: null,
      gender: null,
      bloodType: null,
      phone: null,
      photoUrl: null,
      location: null,
    };

    const putCommand = new PutItemCommand({
      TableName: USERS_TABLE,
      Item: {
        userId: { S: newUser.userId },
        name: { S: newUser.name },
        email: { S: newUser.email },
        password: { S: newUser.password },
        createdAt: { S: newUser.createdAt },
        age: { NULL: true },
        gender: { NULL: true },
        bloodType: { NULL: true },
        phone: { NULL: true },
        photoUrl: { NULL: true },
        location: { NULL: true },
      },
    });

    await dynamo.send(putCommand);

    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "2h" });

    return {
      token,
      userId,
      email,
      name,
      age: null,
      gender: null,
      bloodType: null,
      phone: null,
      photoUrl: null,
      location: {
        latitude: null,
        longitude: null,
        address: null,
      },
    };
  }

  async login(data: { email: string; password: string }) {
    const { email, password } = data;
    const user = await this.getUserByEmail(email);
    if (!user) throw new Error("Invalid email or password");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid email or password");

    const token = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, {
      expiresIn: "2h",
    });

    return {
      token,
      userId: user.userId,
      email: user.email,
      name: user.name ?? null,
      age: user.age ?? null,
      gender: user.gender ?? null,
      bloodType: user.bloodType ?? null,
      phone: user.phone ?? null,
      photoUrl: user.photoUrl ?? null,
      location: user.location ?? {
        latitude: null,
        longitude: null,
        address: null,
      },
    };
  }

  async sendResetCode(email: string) {
    const user = await this.getUserByEmail(email);
    if (!user) throw new Error("User not found");

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiration = Math.floor(Date.now() / 1000) + 300;

    const command = new PutItemCommand({
      TableName: CODES_TABLE,
      Item: {
        email: { S: email },
        code: { S: code },
        expiresAt: { N: expiration.toString() },
      },
    });

    await dynamo.send(command);
    await sendVerificationCodeEmail(email, code);

    return "Verification code sent to email.";
  }

  async verifyResetCode(email: string, code: string) {
    const getCommand = new GetItemCommand({
      TableName: CODES_TABLE,
      Key: {
        email: { S: email },
        code: { S: code }, 
      },
    });

    const result = await dynamo.send(getCommand);
    if (!result.Item) throw new Error("No code found for this email");

    const storedCode = result.Item.code.S;
    const expiresAt = parseInt(result.Item.expiresAt.N || "0");

    if (storedCode !== code) throw new Error("Invalid code");
    if (Date.now() / 1000 > expiresAt) throw new Error("Code expired");

    return true;
  }

  async resetPassword(email: string, newPassword: string) {
  const user = await this.getUserByEmail(email);
  if (!user) throw new Error("User not found");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const command = new PutItemCommand({
    TableName: USERS_TABLE,
    Item: {
      userId: { S: user.userId },
      name: { S: user.name },
      email: { S: user.email },
      password: { S: hashedPassword },
      createdAt: { S: user.createdAt },
      age: user.age ? { N: user.age.toString() } : { NULL: true },
      gender: user.gender ? { S: user.gender } : { NULL: true },
      bloodType: user.bloodType ? { S: user.bloodType } : { NULL: true },
      phone: user.phone ? { S: user.phone } : { NULL: true },
      photoUrl: user.photoUrl ? { S: user.photoUrl } : { NULL: true },
      location: user.location ? { S: JSON.stringify(user.location) } : { NULL: true },
    },
  });

  await dynamo.send(command);
  return { userId: user.userId, email: user.email };
}


  private async getUserByEmail(email: string): Promise<User | null> {
    const command = new QueryCommand({
      TableName: USERS_TABLE,
      IndexName: "email-index", 
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": { S: email },
      },
      Limit: 1,
    });

    const result = await dynamo.send(command);
    if (!result.Items || result.Items.length === 0) return null;

    const item = result.Items[0];

    return {
      userId: item.userId.S!,
      name: item.name.S!,
      email: item.email.S!,
      password: item.password.S!,
      createdAt: item.createdAt.S!,
      age: item.age?.N ? parseInt(item.age.N) : null,
      gender: item.gender?.S ?? null,
      bloodType: item.bloodType?.S ?? null,
      phone: item.phone?.S ?? null,
      photoUrl: item.photoUrl?.S ?? null,
      location: item.location?.S
        ? JSON.parse(item.location.S)
        : { latitude: null, longitude: null, address: null },
    };
  }
}


