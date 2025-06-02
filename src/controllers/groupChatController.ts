import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  createGroupChat,
  addMessageToChat,
  getChatMessages,
  getGroupById,
  verifyUsersExist,
  getUserGroups,
} from '../services/groupChatService';
import { sendNotification } from '../utils/notificationUtils';

export const createCustomGroupChat = async (req: AuthRequest, res: Response): Promise<void> => {
  const creatorEmail = req.user?.email; 
  const { name, memberIds } = req.body;
  
  if (!creatorEmail || !name || !memberIds || !Array.isArray(memberIds)) {
    res.status(400).json({ error: 'Group name and memberIds are required.' });
    return;
  }

  const uniqueMembers = [...new Set([creatorEmail, ...memberIds])];

  try {
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

    const result = await createGroupChat(group);
    res.status(201).json({ message: 'Group chat created', group: result });
  } catch (err) {
    console.error('Create group error:', err);
    res.status(500).json({ error: 'Failed to create group.' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  const senderEmail = req.user?.email;
  const userId = req.user?.userId;

  const { groupId, text } = req.body;

  if (!senderEmail || !groupId || !userId || !text) {
    res.status(400).json({ error: 'groupId and text are required.' });
    return;
  }

  try {
    // const group = await getGroupById(groupId);
    // if (!group) throw new Error('Group not found');
     const groups = await getUserGroups(userId); // Retrieves all groups
     const group= groups.find(group => group.groupId === groupId) || null;
    
     

    if (!group) throw new Error('Group not found');
    const message = await addMessageToChat(groupId, senderEmail, text);
    const recipients = group.members.filter((email: string) => email !== senderEmail);

    await Promise.all(
      recipients.map((userEmail: string) =>
        sendNotification(userEmail, 'chat', 'New group message', `New message in ${group.name}`)
      )
    );
    
    res.status(200).json({ message: 'Message sent', data: message });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: err });
  }
};

export const fetchMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  const { groupId } = req.params;
  if (!groupId) {
    res.status(400).json({ error: 'groupId is required' });
    return;
  }

  try {
    const messages = await getChatMessages(groupId);
    res.status(200).json({ messages });
  } catch (err) {
    console.error('Fetch messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
};


export const getMyGroups = async (req: AuthRequest, res: Response): Promise<void> => {
  const email = req.user?.email;
  if (!email) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const groups = await getUserGroups(email);
    res.status(200).json({ groups });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch groups.' });
  }
};
