import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true   
    },

    content: {
      type: String,
      trim: true
    },

    chat: {           
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true   
    },

    readBy: [          
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text"
    },

    edited: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const Message = mongoose.model("Message", messageSchema);