import { Message } from "../models/message.model.js";
import { Chat } from "../models/chat.model.js";
import { createNotification } from "./notification.controller.js";
import { emitSocketEvent } from "../sockets/socket.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//SEND MESSAGE
const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body || {};

    if (!content || !chatId) {
        throw new ApiError(400, "Content and chatId are required");
    }

    // check chat exists
    const chatExists = await Chat.findById(chatId);
    if (!chatExists) {
        throw new ApiError(404, "Chat not found");
    }

    // create message
    let message = await Message.create({
        sender: req.user._id,
        content,
        chat: chatId,
    });

    // populate message
    message = await message.populate([
        { path: "sender", select: "fullname username email" },
        {
            path: "chat",
            populate: {
                path: "users",
                select: "fullname username email",
            },
        },
    ]);

    // update latest message in chat
    await Chat.findByIdAndUpdate(chatId, {
        latestMessage: message._id,
    });

    const recipients = (message.chat?.users || []).filter(
        (user) => user?._id?.toString() !== req.user._id.toString()
    );

    await Promise.all(recipients.map(async (user) => {
        emitSocketEvent({
            room: user._id,
            event: "message received",
            data: message
        });

        await createNotification({
            user: user._id,
            content: message.content,
            relatedChat: message.chat?._id,
            type: "message"
        });
    }));

    return res.status(201).json(
        new ApiResponse(201, message, "Message sent successfully")
    );
});


// GET MESSAGES
const getMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    if (!chatId) {
        throw new ApiError(400, "ChatId is required");
    }

    const chat = await Chat.findById(chatId)
        .populate("users", "fullname username email")
        .populate("groupAdmin", "fullname username email");

    if (!chat) {
        throw new ApiError(404, "Chat not found");
    }

    const isParticipant = chat.users.some(
        (user) => user?._id?.toString() === req.user?._id?.toString()
    );

    if (!isParticipant) {
        throw new ApiError(403, "You are not allowed to access messages for this chat");
    }

    const messages = await Message.find({ chat: chatId })
        .populate("sender", "fullname username email")
        .populate({
            path: "chat",
            populate: [
                {
                    path: "users",
                    select: "fullname username email"
                },
                {
                    path: "groupAdmin",
                    select: "fullname username email"
                }
            ]
        })
        .sort({ createdAt: 1 });

    return res.status(200).json(
        new ApiResponse(200, messages, "Messages fetched successfully")
    );
});

export {
    getMessages,
    sendMessage
}
