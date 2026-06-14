const mongoose = require("mongoose");
const { STORY_TTL_MS } = require("../configs/env.config");

const storySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    media: {
      url: { type: String, required: true },
      public_id: String,
      resource_type: { type: String, enum: ["image", "video"], default: "image" },
    },

    caption: {
      type: String,
      maxlength: 200,
      default: "",
    },

    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + STORY_TTL_MS),
    },

    viewers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
storySchema.index({ author: 1, expiresAt: -1 });

const Story = mongoose.model("Story", storySchema);
module.exports = Story;
