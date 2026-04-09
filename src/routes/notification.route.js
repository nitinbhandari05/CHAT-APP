import { Router } from "express";
import {
    getNotifications,
    markAsRead
} from "../controllers/notification.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//NOTIFICATION ROUTES 

// Get all notifications
router.get("/", verifyJWT, getNotifications);

// Mark notification as read
router.put("/:id", verifyJWT, markAsRead);

export default router;