const express = require("express");
const uploadRouter = express.Router();

const { uploadSingleFile } = require("../controllers/uplode.controller");
const upload = require("../middlewares/upload");

uploadRouter.post("/single", upload.single("file"), uploadSingleFile);

module.exports = uploadRouter;
