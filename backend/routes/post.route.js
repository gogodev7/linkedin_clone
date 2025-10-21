import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../lib/multerConfig.js";
import {
	createPost,
	getFeedPosts,
	getAllPosts,
	deletePost,
	getPostById,
	createComment,
	likePost,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/", protectRoute, getFeedPosts);
router.get("/all", protectRoute, getAllPosts);
router.post("/create", protectRoute, upload.single("image"), createPost);
router.delete("/delete/:id", protectRoute, deletePost);
router.get("/:id", protectRoute, getPostById);
router.post("/:id/comment", protectRoute, createComment);
router.post("/:id/like", protectRoute, likePost);

export default router;
