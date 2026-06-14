const Story = require("../models/story.model");
const Follow = require("../models/follow.model");
const User = require("../models/user.model");
const { STORY_TTL_MS, MAX_STORIES_PER_USER } = require("../configs/env.config");
const { deleteCloudinaryAsset } = require("../utils/cloudinary.util");
const { cleanupExpiredStories } = require("../utils/storyCleanup.util");
const { createNotification } = require("../utils/notifications.util");

const activeStoryFilter = () => ({ expiresAt: { $gt: new Date() } });

const createStory = async (req, res) => {
  try {
    await cleanupExpiredStories();

    const userId = req.user.id;
    const { caption } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Story media is required." });
    }

    const activeCount = await Story.countDocuments({
      author: userId,
      ...activeStoryFilter(),
    });

    if (activeCount >= MAX_STORIES_PER_USER) {
      await deleteCloudinaryAsset(
        req.file.filename,
        req.file.detectedType || "image"
      );
      return res.status(400).json({
        message: `You can have at most ${MAX_STORIES_PER_USER} active stories.`,
      });
    }

    const story = await Story.create({
      author: userId,
      media: {
        url: req.file.path,
        public_id: req.file.filename,
        resource_type: req.file.detectedType || "image",
      },
      caption: caption || "",
      expiresAt: new Date(Date.now() + STORY_TTL_MS),
    });

    const populated = await Story.findById(story._id).populate(
      "author",
      "fullname username profilePicture"
    );

    return res.status(201).json({
      message: "Story uploaded successfully",
      story: populated,
    });
  } catch (error) {
    console.error("Create Story Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const getStoryFeed = async (req, res) => {
  try {
    await cleanupExpiredStories();

    const userId = req.user.id;

    const followingDocs = await Follow.find({ follower: userId }).select(
      "following"
    );
    const followingIds = followingDocs.map((doc) => doc.following);
    const authorIds = [userId, ...followingIds];

    const stories = await Story.find({
      author: { $in: authorIds },
      ...activeStoryFilter(),
    })
      .populate("author", "fullname username profilePicture")
      .sort({ createdAt: 1 });

    const grouped = {};

    for (const story of stories) {
      const authorKey = story.author._id.toString();
      if (!grouped[authorKey]) {
        grouped[authorKey] = {
          user: story.author,
          stories: [],
          hasUnviewed: false,
        };
      }

      const viewed = story.viewers.some(
        (v) => v.user.toString() === userId.toString()
      );

      if (!viewed) grouped[authorKey].hasUnviewed = true;

      grouped[authorKey].stories.push({
        _id: story._id,
        media: story.media,
        caption: story.caption,
        expiresAt: story.expiresAt,
        createdAt: story.createdAt,
        viewed,
        viewCount: story.viewers.length,
      });
    }

    const feed = Object.values(grouped).sort((a, b) => {
      if (a.hasUnviewed !== b.hasUnviewed) return a.hasUnviewed ? -1 : 1;
      const aLatest = a.stories[a.stories.length - 1]?.createdAt || 0;
      const bLatest = b.stories[b.stories.length - 1]?.createdAt || 0;
      return new Date(bLatest) - new Date(aLatest);
    });

    return res.status(200).json({ feed });
  } catch (error) {
    console.error("Get Story Feed Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const getUserStories = async (req, res) => {
  try {
    await cleanupExpiredStories();

    const { userId } = req.params;
    const viewerId = req.user?.id;

    const user = await User.findById(userId).select(
      "fullname username profilePicture"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const stories = await Story.find({
      author: userId,
      ...activeStoryFilter(),
    }).sort({ createdAt: 1 });

    const formatted = stories.map((story) => ({
      _id: story._id,
      media: story.media,
      caption: story.caption,
      expiresAt: story.expiresAt,
      createdAt: story.createdAt,
      viewed: viewerId
        ? story.viewers.some((v) => v.user.toString() === viewerId.toString())
        : false,
      viewCount: story.viewers.length,
    }));

    return res.status(200).json({ user, stories: formatted });
  } catch (error) {
    console.error("Get User Stories Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const getStoryById = async (req, res) => {
  try {
    const story = await Story.findOne({
      _id: req.params.id,
      ...activeStoryFilter(),
    }).populate("author", "fullname username profilePicture");

    if (!story) {
      return res.status(404).json({ message: "Story not found or expired." });
    }

    const viewerId = req.user?.id;
    const viewed = viewerId
      ? story.viewers.some((v) => v.user.toString() === viewerId.toString())
      : false;

    return res.status(200).json({
      story: {
        _id: story._id,
        author: story.author,
        media: story.media,
        caption: story.caption,
        expiresAt: story.expiresAt,
        createdAt: story.createdAt,
        viewed,
        viewCount: story.viewers.length,
      },
    });
  } catch (error) {
    console.error("Get Story Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const viewStory = async (req, res) => {
  try {
    const storyId = req.params.id;
    const viewerId = req.user.id;

    const story = await Story.findOne({
      _id: storyId,
      ...activeStoryFilter(),
    });

    if (!story) {
      return res.status(404).json({ message: "Story not found or expired." });
    }

    const alreadyViewed = story.viewers.some(
      (v) => v.user.toString() === viewerId.toString()
    );

    if (!alreadyViewed) {
      story.viewers.push({ user: viewerId, viewedAt: new Date() });
      await story.save();

      if (story.author.toString() !== viewerId.toString()) {
        const viewer = await User.findById(viewerId).select("username");
        await createNotification({
          recipientId: story.author,
          senderId: viewerId,
          type: "story_view",
          storyId: story._id,
          message: `${viewer?.username || "Someone"} viewed your story`,
        });
      }
    }

    return res.status(200).json({
      message: "Story marked as viewed",
      viewCount: story.viewers.length,
    });
  } catch (error) {
    console.error("View Story Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const getStoryViewers = async (req, res) => {
  try {
    const story = await Story.findOne({
      _id: req.params.id,
      ...activeStoryFilter(),
    }).populate("viewers.user", "fullname username profilePicture");

    if (!story) {
      return res.status(404).json({ message: "Story not found or expired." });
    }

    if (story.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }

    const viewers = story.viewers
      .map((v) => ({
        user: v.user,
        viewedAt: v.viewedAt,
      }))
      .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt));

    return res.status(200).json({ viewers, count: viewers.length });
  } catch (error) {
    console.error("Get Story Viewers Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: "Story not found." });
    }

    if (story.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }

    await deleteCloudinaryAsset(
      story.media.public_id,
      story.media.resource_type
    );
    await story.deleteOne();

    return res.status(200).json({ message: "Story deleted successfully." });
  } catch (error) {
    console.error("Delete Story Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  createStory,
  getStoryFeed,
  getUserStories,
  getStoryById,
  viewStory,
  getStoryViewers,
  deleteStory,
};
