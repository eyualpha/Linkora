// const multer = require("multer");
// const path = require("path");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/"),
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, Date.now() + "-" + file.fieldname + ext);
//   },
// });

// function fileFilter(req, file, cb) {
//   const allowed = [
//     "image/jpeg",
//     "image/jpg",
//     "image/png",
//     "image/webp",
//     "image/heic",
//   ];
//   if (allowed.includes(file.mimetype)) cb(null, true);
//   else cb(new Error("Only image files are allowed"), false);
// }

// const upload = multer({
//   storage,
//   fileFilter,
// });

// module.exports = upload;

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../configs/cloudinary.config");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let resource_type = "auto"; // auto detects (image, video, raw)
    let folder = "smp_uploads";

    return {
      folder,
      resource_type, // handles images, videos, pdf, audio
      public_id: Date.now() + "-" + file.originalname.split(".")[0],
      format: undefined, // Cloudinary will detect
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // allow up to 50MB
});

module.exports = upload;
