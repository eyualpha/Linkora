const uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });

    const { path, filename } = req.file;

    return res.status(200).json({
      message: "File uploaded successfully",
      url: path, // secure URL
      public_id: filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
};

module.exports = {
  uploadSingleFile,
};
