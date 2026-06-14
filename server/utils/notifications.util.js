const Notification = require("../models/notification.model");

const createNotification = async ({
  recipientId,
  senderId,
  type,
  message,
  postId = null,
  storyId = null,
  commentId = null,
}) => {
  if (!recipientId || !senderId || recipientId.toString() === senderId.toString()) {
    return null;
  }

  try {
    return await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
      post: postId,
      story: storyId,
      comment: commentId,
    });
  } catch (err) {
    console.error("Create notification error:", err.message);
    return null;
  }
};

module.exports = { createNotification };
