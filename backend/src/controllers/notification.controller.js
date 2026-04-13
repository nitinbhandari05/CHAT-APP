import { Notification } from "../models/notification.model.js";
import { emitSocketEvent } from "../sockets/socket.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const formatNotification = (notification) => {
    if (!notification) {
        return notification;
    }

    const plainNotification = notification.toObject
        ? notification.toObject()
        : notification;

    return {
        ...plainNotification,
        id: plainNotification._id?.toString?.() || plainNotification._id,
        chatId:
            plainNotification.relatedChat?._id?.toString?.() ||
            plainNotification.relatedChat?.toString?.() ||
            null
    };
};

// CREATE NOTIFICATION 
const createNotification = async (data) => {
    try {
        if (!data?.user || !data?.content) {
            throw new ApiError(400, "User and content are required");
        }

        const notification = await Notification.create(data);
        const populatedNotification = await Notification.findById(notification._id)
            .populate("relatedChat", "chatName isGroupChat users")
            .populate("user", "fullname username email");

        emitSocketEvent({
            room: data.user,
            event: "notification received",
            data: formatNotification(populatedNotification)
        });

        return formatNotification(populatedNotification);
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
    })
        .populate("relatedChat", "chatName isGroupChat users")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            notifications.map(formatNotification),
            "Notifications fetched successfully"
        )
    );
});

// MARK AS READ
const markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Notification ID is required");
    }

    const existingNotification = await Notification.findById(id);

    if (!existingNotification) {
        throw new ApiError(404, "Notification not found");
    }

    if (existingNotification.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this notification");
    }

    const notification = await Notification.findByIdAndUpdate(
        id,
        {
            isRead: true
        },
        {
            new: true
        }
    ).populate("relatedChat", "chatName isGroupChat users");

    emitSocketEvent({
        room: req.user._id,
        event: "notification read",
        data: formatNotification(notification)
    });

    return res.status(200).json(
        new ApiResponse(200, formatNotification(notification), "Marked as read")
    );
});

// MARK CHAT NOTIFICATIONS AS READ
const markChatNotificationsAsRead = asyncHandler(async (req, res) => {
    const chatId = req.params.chatId || req.body?.chatId;

    if (!chatId) {
        throw new ApiError(400, "Chat ID is required");
    }

    const unreadNotifications = await Notification.find({
        user: req.user._id,
        relatedChat: chatId,
        isRead: false
    }).populate("relatedChat", "chatName isGroupChat users");

    if (!unreadNotifications.length) {
        return res.status(200).json(
            new ApiResponse(200, { count: 0, chatId: String(chatId) }, "No unread notifications")
        );
    }

    await Notification.updateMany(
        {
            user: req.user._id,
            relatedChat: chatId,
            isRead: false
        },
        {
            isRead: true
        }
    );

    unreadNotifications.forEach((notification) => {
        emitSocketEvent({
            room: req.user._id,
            event: "notification read",
            data: formatNotification({
                ...notification.toObject(),
                isRead: true
            })
        });
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                count: unreadNotifications.length,
                chatId: String(chatId)
            },
            "Chat notifications marked as read"
        )
    );
});

export {
    createNotification,
    getNotifications,
    markAsRead,
    markChatNotificationsAsRead
}
