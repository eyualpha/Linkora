const cloudinary = require("../configs/cloudinary.config");

const deleteCloudinaryAsset = async (publicId, resourceType = "image") => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType === "video" ? "video" : "image",
    });
  } catch (err) {
    console.error("Cloudinary delete failed:", publicId, err.message);
  }
};

const deleteCloudinaryAssets = async (files = []) => {
  await Promise.all(
    files.map((file) =>
      deleteCloudinaryAsset(file.public_id, file.resource_type)
    )
  );
};

const deleteCloudinaryByUrl = async (url) => {
  if (!url || !url.includes("cloudinary.com")) return;
  try {
    const publicId = cloudinary.utils.extract_public_id(url);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (err) {
    console.error("Cloudinary delete by URL failed:", err.message);
  }
};

module.exports = {
  deleteCloudinaryAsset,
  deleteCloudinaryAssets,
  deleteCloudinaryByUrl,
};
