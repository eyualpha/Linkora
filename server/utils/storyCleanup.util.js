const Story = require("../models/story.model");
const { deleteCloudinaryAsset } = require("./cloudinary.util");

const cleanupExpiredStories = async () => {
  const expired = await Story.find({ expiresAt: { $lte: new Date() } }).lean();

  if (expired.length === 0) return 0;

  await Promise.all(
    expired.map((story) =>
      deleteCloudinaryAsset(story.media?.public_id, story.media?.resource_type)
    )
  );

  const result = await Story.deleteMany({
    _id: { $in: expired.map((s) => s._id) },
  });

  return result.deletedCount;
};

module.exports = { cleanupExpiredStories };
