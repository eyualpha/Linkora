const express = require("express");
const {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markConversationRead,
  getUnreadCount,
} = require("../controllers/chat.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware");

const chatRouter = express.Router();

chatRouter.get("/", isAuthenticated, getConversations);
chatRouter.get("/unread-count", isAuthenticated, getUnreadCount);
chatRouter.post("/", isAuthenticated, getOrCreateConversation);
chatRouter.get("/:id/messages", isAuthenticated, getMessages);
chatRouter.post("/:id/messages", isAuthenticated, sendMessage);
chatRouter.put("/:id/read", isAuthenticated, markConversationRead);

module.exports = chatRouter;
