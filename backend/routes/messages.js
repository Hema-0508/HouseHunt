const express = require('express');
const router = express.Router();
const { getCollection } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');

const messagesCollection = getCollection('messages');
const usersCollection = getCollection('users');

// GET all conversation threads (grouped by user)
router.get('/', authenticateToken, (req, res) => {
  const currentUserId = req.user.id;
  const messages = messagesCollection.find(m => 
    m.senderId === currentUserId || m.receiverId === currentUserId
  );

  // Group by partner user ID
  const threads = {};

  messages.forEach(msg => {
    const partnerId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
    
    if (!threads[partnerId]) {
      threads[partnerId] = {
        partnerId,
        lastMessage: msg,
        unreadCount: 0 // simple placeholder for unread count
      };
    } else {
      // Keep only the latest message
      const currentLast = threads[partnerId].lastMessage;
      if (new Date(msg.timestamp) > new Date(currentLast.timestamp)) {
        threads[partnerId].lastMessage = msg;
      }
    }
  });

  // Fetch partner user names & roles
  const threadList = Object.values(threads).map(thread => {
    const partner = usersCollection.findById(thread.partnerId);
    return {
      ...thread,
      partner: partner ? {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        role: partner.role
      } : { name: 'Unknown User', role: 'user' }
    };
  });

  // Sort threads by latest message timestamp
  threadList.sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));

  res.json(threadList);
});

// GET messages with a specific user
router.get('/:partnerId', authenticateToken, (req, res) => {
  const currentUserId = req.user.id;
  const { partnerId } = req.params;

  const chatHistory = messagesCollection.find(m => 
    (m.senderId === currentUserId && m.receiverId === partnerId) ||
    (m.senderId === partnerId && m.receiverId === currentUserId)
  );

  // Sort by timestamp ascending
  chatHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const partner = usersCollection.findById(partnerId);
  const partnerDetails = partner ? {
    id: partner.id,
    name: partner.name,
    email: partner.email,
    role: partner.role
  } : { name: 'Unknown User', role: 'user' };

  res.json({
    partner: partnerDetails,
    messages: chatHistory
  });
});

// POST send a message
router.post('/', authenticateToken, (req, res) => {
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    return res.status(400).json({ message: 'ReceiverId and content are required.' });
  }

  const receiver = usersCollection.findById(receiverId);
  if (!receiver) {
    return res.status(404).json({ message: 'Receiver not found.' });
  }

  const newMsg = messagesCollection.insert({
    senderId: req.user.id,
    receiverId,
    content,
    timestamp: new Date().toISOString()
  });

  res.status(201).json(newMsg);
});

module.exports = router;
