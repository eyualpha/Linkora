const Notification = require("../models/notification.model");
const { getPagination, paginatedResponse } = require("../utils/pagination");

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit, skip } = getPagination(req);

    const [notifications, total] = await Promise.all([
      Notification.find({ recipient: userId })
        .populate("sender", "fullname username profilePicture")
        .populate("post", "text")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ recipient: userId }),
    ]);

    const { pagination } = paginatedResponse(
      notifications,
      total,
      page,
      limit
    );

    return res.status(200).json({ notifications, pagination });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });

    return res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("Get Unread Count Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    return res.status(200).json({ message: "Notification marked as read." });
  } catch (error) {
    console.error("Mark As Read Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({ message: "All notifications marked as read." });
  } catch (error) {
    console.error("Mark All As Read Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Notification not found." });
    }

    return res.status(200).json({ message: "Notification deleted." });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
