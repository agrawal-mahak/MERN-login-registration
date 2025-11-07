import express from "express";
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  getMyPosts,
} from "../controller/Post.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Create a new post (protected)
router.post("/", protect, createPost);

// Get all posts (public)
router.get("/", getPosts);

// Get current user's posts (protected)
router.get("/my/posts", protect, getMyPosts);

// Get a single post by ID (public)
router.get("/:id", getPost);

// Update a post (protected - only author)
router.put("/:id", protect, updatePost);

// Delete a post (protected - only author)
router.delete("/:id", protect, deletePost);

export default router;

