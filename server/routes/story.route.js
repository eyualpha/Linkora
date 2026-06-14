const express = require("express");
const {
  createStory,
  getStoryFeed,
  getUserStories,
  getStoryById,
  viewStory,
  getStoryViewers,
  toggleStoryLike,
  deleteStory,
} = require("../controllers/story.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const uploadStory = require("../middlewares/uploadStory");

const storyRouter = express.Router();

storyRouter.post("/", isAuthenticated, uploadStory.single("media"), createStory);
storyRouter.get("/feed", isAuthenticated, getStoryFeed);
storyRouter.get("/user/:userId", isAuthenticated, getUserStories);

storyRouter.put("/like/:id", isAuthenticated, toggleStoryLike);
storyRouter.get("/:id/viewers", isAuthenticated, getStoryViewers);
storyRouter.post("/:id/view", isAuthenticated, viewStory);
storyRouter.get("/:id", isAuthenticated, getStoryById);
storyRouter.delete("/:id", isAuthenticated, deleteStory);

module.exports = storyRouter;
