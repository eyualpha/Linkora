const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const User = require("../models/user.model");
const { getPagination, paginatedResponse } = require("../utils/pagination");
const { createNotification } = require("../utils/notifications.util");

const buildParticipantsKey = (userId1, userId2) =>
  [userId1.toString(), userId2.toString()].sort().join(":");

const toParticipantId = (participant) => (participant?._id ?? participant)?.toString();

const getOtherParticipant = (conversation, userId) =>
  conversation.participants.find((p) => toParticipantId(p) !== userId.toString());

const formatConversation = (conversation, userId) => {
  const otherUser = getOtherParticipant(conversation, userId);
  const unreadCount = conversation.unreadCounts?.get?.(userId.toString()) ?? 0;

  return {
    _id: conversation._id,
    otherUser,
    lastMessage: conversation.lastMessage,
    unreadCount,
    updatedAt: conversation.updatedAt,
    createdAt: conversation.createdAt,
  };
};

const findConversationForUser = async (conversationId, userId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  }).populate("participants", "fullname username profilePicture");

  return conversation;
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit, skip } = getPagination(req);

    const filter = { participants: userId };

    const [conversations, total] = await Promise.all([
      Conversation.find(filter)
        .populate("participants", "fullname username profilePicture")
        .sort({ "lastMessage.createdAt": -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Conversation.countDocuments(filter),
    ]);

    const formatted = conversations.map((c) => formatConversation(c, userId));
    const { pagination } = paginatedResponse(formatted, total, page, limit);

    return res.status(200).json({ conversations: formatted, pagination });
  } catch (error) {
    console.error("Get Conversations Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: "Recipient is required." });
    }

    if (recipientId === userId) {
      return res.status(400).json({ message: "You cannot message yourself." });
    }

    const recipient = await User.findById(recipientId).select("_id fullname username profilePicture");
    if (!recipient) {
      return res.status(404).json({ message: "User not found." });
    }

    const participantsKey = buildParticipantsKey(userId, recipientId);

    let conversation = await Conversation.findOne({ participantsKey }).populate(
      "participants",
      "fullname username profilePicture"
    );

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, recipientId],
        participantsKey,
      });
      conversation = await conversation.populate(
        "participants",
        "fullname username profilePicture"
      );
    }

    return res.status(200).json({
      conversation: formatConversation(conversation, userId),
    });
  } catch (error) {
    console.error("Get Or Create Conversation Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { page, limit, skip } = getPagination(req, 50);

    const conversation = await findConversationForUser(id, userId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const [messages, total] = await Promise.all([
      Message.find({ conversation: id })
        .populate("sender", "fullname username profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ conversation: id }),
    ]);

    const chronological = messages.reverse();
    const { pagination } = paginatedResponse(chronological, total, page, limit);

    return res.status(200).json({
      messages: chronological,
      pagination,
      conversation: formatConversation(conversation, userId),
    });
  } catch (error) {
    console.error("Get Messages Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const content = req.body.content?.trim();

    if (!content) {
      return res.status(400).json({ message: "Message content is required." });
    }

    if (content.length > 2000) {
      return res.status(400).json({ message: "Message is too long (max 2000 characters)." });
    }

    const conversation = await Conversation.findOne({
      _id: id,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const message = await Message.create({
      conversation: id,
      sender: userId,
      content,
      readBy: [{ user: userId, readAt: new Date() }],
    });

    const populatedMessage = await message.populate("sender", "fullname username profilePicture");

    const recipientId = conversation.participants.find((p) => p.toString() !== userId)?.toString();
    const recipientUnread = conversation.unreadCounts?.get?.(recipientId) ?? 0;

    conversation.lastMessage = {
      content,
      sender: userId,
      createdAt: message.createdAt,
    };

    if (recipientId) {
      conversation.unreadCounts.set(recipientId, recipientUnread + 1);
    }
    conversation.unreadCounts.set(userId, 0);
    conversation.markModified("unreadCounts");
    await conversation.save();

    if (recipientId) {
      const sender = await User.findById(userId).select("username");
      const preview = content.length > 80 ? `${content.slice(0, 80)}…` : content;
      await createNotification({
        recipientId,
        senderId: userId,
        type: "message",
        message: `${sender?.username ?? "Someone"} sent you a message: ${preview}`,
        conversationId: id,
      });
    }

    return res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error("Send Message Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const markConversationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const conversation = await Conversation.findOne({
      _id: id,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const now = new Date();

    await Message.updateMany(
      {
        conversation: id,
        sender: { $ne: userId },
        "readBy.user": { $ne: userId },
      },
      { $push: { readBy: { user: userId, readAt: now } } }
    );

    conversation.unreadCounts.set(userId, 0);
    conversation.markModified("unreadCounts");
    await conversation.save();

    return res.status(200).json({ message: "Conversation marked as read." });
  } catch (error) {
    console.error("Mark Conversation Read Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({ participants: userId }).select("unreadCounts");

    let unreadCount = 0;
    for (const conversation of conversations) {
      unreadCount += conversation.unreadCounts?.get?.(userId) ?? 0;
    }

    return res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("Get Chat Unread Count Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markConversationRead,
  getUnreadCount,
};
