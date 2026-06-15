const mongoose = require("mongoose");

const lastMessageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, maxlength: 2000 },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 2,
        message: "A conversation must have exactly two participants.",
      },
      required: true,
    },
    participantsKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    lastMessage: {
      type: lastMessageSchema,
      default: null,
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1, updatedAt: -1 });
conversationSchema.index({ "lastMessage.createdAt": -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
