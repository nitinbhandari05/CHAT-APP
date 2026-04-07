import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true   
    },

    type: {
      type: String,
      enum: ["message", "mention", "system"],
      default: "message"
    },

    content: {
      type: String,
      trim: true     
    },

    relatedChat: {
      type: Schema.Types.ObjectId,   
      ref: "Chat"
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const Notification = mongoose.model(
  "Notification",
  notificationSchema
);