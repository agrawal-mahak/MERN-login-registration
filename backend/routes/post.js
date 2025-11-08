import express from "express";
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  getMyPosts,
  toggleLike,
  addComment,
} from "../controller/Post.js";
import { protect } from "../middleware/auth.js";
import uploadSingleImage from "../middleware/upload.js";

const router = express.Router();

const handleUpload = (req, res, next) => {
  uploadSingleImage(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Image upload failed" });
    }
    next();
  });
};

// Create a new post (protected)
router.post("/", protect, handleUpload, createPost);

// Get all posts (public)
router.get("/", getPosts);

// Get current user's posts (protected)
router.get("/my/posts", protect, getMyPosts);

// Like/unlike a post (protected)
router.post("/:id/like", protect, toggleLike);

// Add a comment to a post (protected)
router.post("/:id/comments", protect, addComment);

// Get a single post by ID (public)
router.get("/:id", getPost);

// Update a post (protected - only author)
router.put("/:id", protect, handleUpload, updatePost);

// Delete a post (protected - only author)
router.delete("/:id", protect, deletePost);

export default router;

