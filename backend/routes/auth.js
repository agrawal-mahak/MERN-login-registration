import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { uploadProfileImage } from "../middleware/upload.js";
import { uploadImage, deleteImage } from "../config/cloudinary.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const sanitizeUser = (userDoc) => {
  if (!userDoc) return null;
  const plainUser =
    typeof userDoc.toObject === "function" ? userDoc.toObject() : userDoc;

  return {
    _id: plainUser._id,
    username: plainUser.username,
    email: plainUser.email,
    profileImageUrl: plainUser.profileImageUrl ?? null,
    createdAt: plainUser.createdAt,
    updatedAt: plainUser.updatedAt,
  };
};

const toBoolean = (value) =>
  value === true ||
  value === "true" ||
  value === 1 ||
  value === "1" ||
  value === "on";

const handleProfileImageUpload = (req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    return next();
  }

  uploadProfileImage(req, res, (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: err.message || "Image upload failed" });
    }
    next();
  });
};

// Register a new user
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);
    const sanitizedUser = sanitizeUser(user);
    res.status(201).json({
      id: sanitizedUser._id,
      username: sanitizedUser.username,
      email: sanitizedUser.email,
      profileImageUrl: sanitizedUser.profileImageUrl,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// login a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = generateToken(user._id);
    const sanitizedUser = sanitizeUser(user);
    res.status(200).json({
      id: sanitizedUser._id,
      username: sanitizedUser.username,
      email: sanitizedUser.email,
      profileImageUrl: sanitizedUser.profileImageUrl,
      token: token,
      message: "Login successful",
    });

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// me
router.get("/me", protect, async (req, res) => {
  const sanitizedUser = sanitizeUser(req.user);
  res.status(200).json(sanitizedUser);
});

router.put("/me", protect, handleProfileImageUpload, async (req, res) => {
  try {
    const { username, email, password, removeProfileImage } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const trimmedUsername =
      typeof username === "string" ? username.trim() : undefined;
    const trimmedEmail = typeof email === "string" ? email.trim() : undefined;
    const trimmedPassword =
      typeof password === "string" ? password.trim() : undefined;

    if (trimmedUsername && trimmedUsername !== user.username) {
      const existingUsername = await User.findOne({
        username: trimmedUsername,
        _id: { $ne: user._id },
      });
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      user.username = trimmedUsername;
    }

    if (trimmedEmail && trimmedEmail.toLowerCase() !== user.email) {
      const normalizedEmail = trimmedEmail.toLowerCase();
      const existingEmail = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = normalizedEmail;
    }

    if (trimmedPassword) {
      user.password = trimmedPassword;
    }

    if (req.file) {
      if (user.profileImagePublicId) {
        await deleteImage(user.profileImagePublicId);
      }
      const uploadedImage = await uploadImage(req.file, { folder: "profiles" });
      user.profileImageUrl = uploadedImage.secure_url;
      user.profileImagePublicId = uploadedImage.public_id;
    } else if (toBoolean(removeProfileImage)) {
      if (user.profileImagePublicId) {
        await deleteImage(user.profileImagePublicId);
      }
      user.profileImageUrl = null;
      user.profileImagePublicId = null;
    }

    const updatedUser = await user.save();
    const sanitizedUser = sanitizeUser(updatedUser);

    return res.status(200).json({
      message: "Profile updated successfully",
      user: sanitizedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// generate a jwt
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
}



export default router;