const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../configs/cloudinary.config");

function detectFileType(mimetype) {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  return "raw";
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const detectedType = detectFileType(file.mimetype);
    file.detectedType = detectedType;

    return {
      folder: "story_uploads",
      public_id: `story-${Date.now()}-${file.originalname.split(".")[0]}`,
      resource_type: detectedType === "video" ? "video" : "image",
    };
  },
});

const uploadStory = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed =
      file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/");
    if (allowed) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed for stories"));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1,
  },
});

module.exports = uploadStory;
