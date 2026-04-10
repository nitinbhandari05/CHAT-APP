import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ACCESS 1-1 CHAT
export const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body || {};

    if (!userId) {
        throw new ApiError(400, "UserId is required");
    }

    if (userId.toString() === req.user._id.toString()) {
        throw new ApiError(400, "You cannot start a chat with yourself");
    }

    const targetUser = await User.findById(userId).select("-password -refreshToken");

    if (!targetUser) {
        throw new ApiError(404, "User not found");
    }

    // check existing chat
    let chat = await Chat.findOne({
        isGroupChat: false,
        users: { $all: [req.user._id, userId] },
    })
        .populate("users", "-password")
        .populate("latestMessage");

    if (chat) {
        return res.status(200).json(
            new ApiResponse(200, chat, "Chat fetched successfully")
        );
    }

    // create new chat
    const newChat = await Chat.create({
        isGroupChat: false,
        users: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(newChat._id)
        .populate("users", "-password");

    return res.status(201).json(
        new ApiResponse(201, fullChat, "Chat created successfully")
    );
});


//  CREATE GROUP CHAT 
export const createGroupChat = asyncHandler(async (req, res) => {
    let { name, users } = req.body || {};

    if (!name || !users) {
        throw new ApiError(400, "Name and users are required");
    }

    // if users sent as string → parse
    if (typeof users === "string") {
        users = JSON.parse(users);
    }

    if (users.length < 2) {
        throw new ApiError(400, "Group chat must have at least 2 users");
    }

    users.push(req.user._id);

    const group = await Chat.create({
        chatName: name,
        users,
        isGroupChat: true,
        groupAdmin: req.user._id,
    });

    const fullGroup = await Chat.findById(group._id)
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    return res.status(201).json(
        new ApiResponse(201, fullGroup, "Group chat created successfully")
    );
});


//  GET ALL CHATS
export const getChats = asyncHandler(async (req, res) => {
    const chats = await Chat.find({
        users: { $in: [req.user._id] },
    })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate({
            path: "latestMessage",
            populate: {
                path: "sender",
                select: "fullname username email",
            },
        })
        .sort({ updatedAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, chats, "Chats fetched successfully")
    );
});
