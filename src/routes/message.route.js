import { Router } from "express";
import {
    sendMessage,
    getMessages
} from "../controllers/message.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//MESSAGE ROUTES

// Send a message
router.post("/", verifyJWT, sendMessage);

// Get all messages of a specific chat
router.get("/:chatId", verifyJWT, getMessages);

export default router;