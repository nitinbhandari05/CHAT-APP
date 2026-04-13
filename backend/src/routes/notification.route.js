import { Router } from "express";
import {
    getNotifications,
    markAsRead,
    markChatNotificationsAsRead
} from "../controllers/notification.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//NOTIFICATION ROUTES 

// Get all notifications
router.get("/", verifyJWT, getNotifications);

// Mark all notifications in a chat as read
router.put("/chat/:chatId/read", verifyJWT, markChatNotificationsAsRead);

// Mark notification as read
router.put("/:id", verifyJWT, markAsRead);

export default router;
