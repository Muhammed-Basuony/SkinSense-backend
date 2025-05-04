import { DynamoDBClient, PutItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { transporter } from "../utils/mailer";
import { User, generateUserId } from "../models/User.models";

const dynamo = new DynamoDBClient({ region: "eu-north-1" });
const USERS_TABLE = "SkinSenseUsers";
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

    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "2h" });

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

    const token = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, { expiresIn: "2h" });

    return {
      token,
      userId: user.userId,
      email: user.email,
      name: user.name,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.getUserByEmail(email);
    if (!user) throw new Error("User not found");

    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `http://localhost:3000/reset-password?token=${token}&email=${email}`;

    await transporter.sendMail({
      from: '"SkinSense Support" <support@skinsense.app>',
      to: email,
      subject: "Reset Your SkinSense Password",
      html: `
        <h2>Reset Password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    return "Reset password link sent to your email";
  }

  async resetPassword(data: { email: string; token: string; newPassword: string }) {
    const { email, token, newPassword } = data;

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.email !== email) throw new Error("Token does not match the provided email");
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        throw new Error("Reset token has expired. Please request a new one.");
      }
      throw new Error("Invalid or expired token.");
    }

    const user = await this.getUserByEmail(email);
    if (!user) throw new Error("User not found");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateCommand = new PutItemCommand({
      TableName: USERS_TABLE,
      Item: {
        userId: { S: user.userId },
        name: { S: user.name },
        email: { S: user.email },
        password: { S: hashedPassword },
        createdAt: { S: user.createdAt },
      },
    });

    await dynamo.send(updateCommand);

    return { userId: user.userId, email: user.email };
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
