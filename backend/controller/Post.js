import Post from "../models/Post.js";
import { uploadImage, deleteImage } from "../config/cloudinary.js";

export const createPost = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { title, content } = req.body || {};
    const normalizedTitle = typeof title === "string" ? title.trim() : "";
    const normalizedContent = typeof content === "string" ? content.trim() : "";

    if (!normalizedTitle || !normalizedContent) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    let uploadedImage;
    if (req.file) {
      uploadedImage = await uploadImage(req.file);
    }

    const post = await Post.create({
      title: normalizedTitle,
      content: normalizedContent,
      author_id: req.user._id,
      imageUrl: uploadedImage?.secure_url,
      imagePublicId: uploadedImage?.public_id,
    });

    // Fetch the post with populated author information
    const populatedPost = await Post.findById(post._id)
      .populate("author_id", "username email profileImageUrl")
      .populate("comments.user", "username email profileImageUrl");

    res.status(201).json({  
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message
    });
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author_id", "username email profileImageUrl")
      .populate("comments.user", "username email profileImageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get a single post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author_id", "username email profileImageUrl")
      .populate("comments.user", "username email profileImageUrl");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (only author can update)
export const updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user is the author
    if (post.author_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this post" });
    }

    // Update fields
    if (title) post.title = title;
    if (content) post.content = content;
    post.updatedAt = Date.now();

    const shouldRemoveImage =
      req.body?.removeImage === true || req.body?.removeImage === "true";

    if (req.file) {
      if (post.imagePublicId) {
        await deleteImage(post.imagePublicId);
      }
      const uploadedImage = await uploadImage(req.file);
      post.imageUrl = uploadedImage.secure_url;
      post.imagePublicId = uploadedImage.public_id;
    } else if (shouldRemoveImage && post.imagePublicId) {
      await deleteImage(post.imagePublicId);
      post.imageUrl = undefined;
      post.imagePublicId = undefined;
    }

    const updatedPost = await post.save();
    await updatedPost.populate([
      { path: "author_id", select: "username email profileImageUrl" },
      { path: "comments.user", select: "username email profileImageUrl" },
    ]);

    res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (only author can delete)
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user is the author
    if (post.author_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(req.params.id);

    if (post.imagePublicId) {
      await deleteImage(post.imagePublicId);
    }

    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.some(
      (likeId) => likeId.toString() === userId.toString()
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (likeId) => likeId.toString() !== userId.toString()
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();

    const populatedPost = await Post.findById(postId)
      .populate("author_id", "username email profileImageUrl")
      .populate("comments.user", "username email profileImageUrl");

    return res.status(200).json({
      message: alreadyLiked ? "Like removed" : "Post liked",
      liked: !alreadyLiked,
      likesCount: populatedPost.likes.length,
      post: populatedPost,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user?._id;
    const text =
      typeof req.body?.text === "string" ? req.body.text.trim() : "";

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    if (text.length > 500) {
      return res
        .status(400)
        .json({ message: "Comment must be 500 characters or less" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      user: userId,
      text,
    });

    await post.save();

    const populatedPost = await Post.findById(postId)
      .populate("author_id", "username email profileImageUrl")
      .populate("comments.user", "username email profileImageUrl");

    const newComment =
      populatedPost.comments[populatedPost.comments.length - 1];

    return res.status(201).json({
      message: "Comment added",
      post: populatedPost,
      comment: newComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get posts by current user
// @route   GET /api/posts/my/posts
// @access  Private
export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author_id: req.user._id })
      .populate("author_id", "username email profileImageUrl")
      .populate("comments.user", "username email profileImageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

