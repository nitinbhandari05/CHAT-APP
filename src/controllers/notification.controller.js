import { Notification } from "../models/notification.model.js";
import { emitSocketEvent } from "../sockets/socket.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// CREATE NOTIFICATION 
const createNotification = async (data) => {
    try {
        if (!data?.user || !data?.content) {
            throw new ApiError(400, "User and content are required");
        }

        const notification = await Notification.create(data);

        emitSocketEvent({
            room: notification.user,
            event: "notification received",
            data: notification
        });

        return notification;
    } catch (error) {
        throw new ApiError(
            error.statusCode || 500,
            error.message || "Failed to create notification"
        );
    }
};

//  GET NOTIFICATIONS
const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({
        user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, notifications, "Notifications fetched successfully")
    );
});

// MARK AS READ
const markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Notification ID is required");
    }

    const notification = await Notification.findById(id);

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    //  SECURITY CHECK 
    if (notification.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized action");
    }

    notification.isRead = true;
    await notification.save();

    emitSocketEvent({
        room: req.user._id,
        event: "notification read",
        data: notification
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Marked as read")
    );
});

export {
    createNotification,
    getNotifications,
    markAsRead
}
