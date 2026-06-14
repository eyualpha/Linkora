const express = require("express");
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notification.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware");

const notificationRouter = express.Router();

notificationRouter.get("/", isAuthenticated, getNotifications);
notificationRouter.get("/unread-count", isAuthenticated, getUnreadCount);
notificationRouter.put("/read-all", isAuthenticated, markAllAsRead);
notificationRouter.put("/:id/read", isAuthenticated, markAsRead);
notificationRouter.delete("/:id", isAuthenticated, deleteNotification);

module.exports = notificationRouter;
