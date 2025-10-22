import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../lib/multerConfig.js";
import { getSuggestedConnections, getPublicProfile, updateProfile, searchUsers, getConnectedUsers } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/search", protectRoute, searchUsers);
router.get("/suggestions", protectRoute, getSuggestedConnections);
router.get('/connected', protectRoute, getConnectedUsers);
router.get("/:username", protectRoute, getPublicProfile);

router.put(
    "/profile",
    protectRoute,
    upload.fields([
        { name: "profilePicture", maxCount: 1 },
        { name: "bannerImg", maxCount: 1 },
    ]),
    updateProfile
);

export default router;
