import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  createGroupChat,
  addMessageToChat,
  getChatMessages,
  getGroupById,
  getGroupsForUser,
} from "../services/groupChatService";
import { sendNotification } from "../utils/notificationUtils";
import { verifyUsersExist } from "../services/userService";

export const createCustomGroupChat = async (req: AuthRequest, res: Response): Promise<void> => {
  const creatorId = req.user?.userId;
  const { name, members } = req.body;

  if (!creatorId || !name || !Array.isArray(members)) {
    res.status(400).json({ error: "Group name and members are required." });
    return;
  }

  const uniqueMembers = [...new Set([creatorId, ...members])];

  try {
    const valid = await verifyUsersExist(uniqueMembers);
    if (!valid) {
      res.status(400).json({ error: "One or more user IDs are invalid." });
      return;
    }

    const group = await createGroupChat({
      groupId: uuidv4(),
      name,
      members: uniqueMembers,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "Custom group created", group });
  } catch (err) {
    console.error("Error creating custom group:", err);
    res.status(500).json({ error: "Failed to create custom group." });
  }
};


export const startGroupChat = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { participantIds } = req.body;

  if (!userId || !participantIds?.length) {
    res.status(400).json({ error: "Participants are required." });
    return;
  }

  try {
    const chatId = uuidv4();
    const participants = [...new Set([userId, ...participantIds])];

    const result = await createGroupChat({
      groupId: chatId,
      name: "SkinSense Support Group",
      members: participants,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "Group chat created", data: result });
  } catch (err) {
    console.error("Error starting group chat:", err);
    res.status(500).json({ error: "Failed to create group chat." });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  const senderId = req.user?.userId;
  const { chatId, text } = req.body;

  if (!senderId || !chatId || !text) {
    res.status(400).json({ error: "chatId and message text are required." });
    return;
  }

  try {
    const result = await addMessageToChat(chatId, senderId, text);

    const group = await getGroupById(chatId);
    if (!group || !group.members) {
      res.status(404).json({ error: "Group not found." });
      return;
    }

    const recipients = group.members.filter((id: string) => id !== senderId);

    await Promise.all(
      recipients.map((userId: string) =>
        sendNotification(
          userId,
          "chat",
          "New group message",
          `New message in ${group.name}`
        )
      )
    );

    res.status(200).json({ message: "Message sent", data: result });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Failed to send message." });
  }
};

export const fetchMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  const { chatId } = req.params;

  if (!chatId) {
    res.status(400).json({ error: "chatId is required." });
    return;
  }

  try {
    const messages = await getChatMessages(chatId);
    res.status(200).json({ messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
};

export const listUserGroups = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const groups = await getGroupsForUser(userId);
    res.status(200).json({ groups });
  } catch (err) {
    console.error("Error fetching user groups:", err);
    res.status(500).json({ error: "Failed to fetch group chats." });
  }
};
