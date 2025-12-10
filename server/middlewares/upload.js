const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../configs/cloudinary.config");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const folder = "smp_uploads";
    const sanitized = file.originalname
      .split(".")[0]
      .toString()
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const publicIdBase = sanitized || Date.now();

    return {
      folder,
      resource_type: "image",
      public_id: `${Date.now()}-${publicIdBase}`,
      format: undefined,
    };
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }

    return cb(new Error("Only image files are allowed"));
  },
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 2,
  },
});

module.exports = upload;
