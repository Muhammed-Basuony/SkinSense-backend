import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  createGroupChat,
  addMessageToChat,
  getChatMessages,
  getGroupById,
  verifyUsersExist,
  getUserGroups
} from '../services/groupChatService';
import { sendNotification } from '../utils/notificationUtils';

export const createCustomGroupChat = async (req: AuthRequest, res: Response): Promise<void> => {
  const creatorId = req.user?.userId;
  const { name, memberIds } = req.body;

  if (!creatorId || !name || !memberIds || !Array.isArray(memberIds)) {
    res.status(400).json({ error: 'Group name and memberIds are required.' });
    return;
  }

  const uniqueMembers = [...new Set([creatorId, ...memberIds])];
  const invalidUsers = await verifyUsersExist(uniqueMembers);

  if (invalidUsers.length > 0) {
    res.status(400).json({ error: `Invalid users: ${invalidUsers.join(', ')}` });
    return;
  }

  const group = {
    groupId: uuidv4(),
    name,
    members: uniqueMembers,
    createdAt: new Date().toISOString(),
  };

  try {
    const result = await createGroupChat(group);
    res.status(201).json({ message: 'Group chat created', group: result });
  } catch (err) {
    console.error('Create group error:', err);
    res.status(500).json({ error: 'Failed to create group.' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  const senderId = req.user?.userId;
  const { chatId, text } = req.body;

  if (!senderId || !chatId || !text) {
    res.status(400).json({ error: 'chatId and text are required.' });
    return;
  }

  try {
    const group = await getGroupById(chatId);
    if (!group) throw new Error('Group not found');

    const message = await addMessageToChat(chatId, senderId, text);
    const recipients = group.members.filter((id: string) => id !== senderId);

    await Promise.all(
      recipients.map((userId: string) =>
        sendNotification(userId, 'chat', 'New group message', `New message in ${group.name}`)
      )
    );

    res.status(200).json({ message: 'Message sent', data: message });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to send message.' });
  }
};

export const fetchMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  const { chatId } = req.params;
  if (!chatId) {
    res.status(400).json({ error: 'chatId required' });
    return;
  }

  try {
    const messages = await getChatMessages(chatId);
    res.status(200).json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
};

export const getMyGroups = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const groups = await getUserGroups(userId);
    res.status(200).json({ groups });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch groups.' });
  }
};
