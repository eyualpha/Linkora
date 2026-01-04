const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../configs/cloudinary.config");

function detectFileType(mimetype) {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("audio/")) return "video";
  if (mimetype === "application/pdf") return "pdf";
  return "raw";
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Detect file type
    const detectedType = detectFileType(file.mimetype);
    req.fileType = detectedType; // backward compatibility for single uploads
    file.detectedType = detectedType; // preserve on file object for controllers

    let resource_type = "auto";
    let folder = "smp_uploads";

    return {
      folder,
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
      format: undefined,
    };
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 2, 
  },
});

module.exports = upload;
