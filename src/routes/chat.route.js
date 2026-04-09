import { Router } from "express";
import {
    accessChat,
    createGroupChat,
    getChats
} from "../controllers/chat.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//  CHAT ROUTES 

// Create or access 1-1 chat
router.post("/", verifyJWT, accessChat);

// Create group chat
router.post("/group", verifyJWT, createGroupChat);

// Get all chats of logged-in user
router.get("/", verifyJWT, getChats);

export default router;