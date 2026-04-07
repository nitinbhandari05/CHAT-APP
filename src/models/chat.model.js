import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema(
  {
    chatName: {
      type: String,
      trim: true
    },

    isGroupChat: {
      type: Boolean,
      default: false
    },

    users: [   
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    groupAdmin: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },

    latestMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message"
    },

  
    lastActivity: {   
      type: Date,
      default: Date.now
    },

    pinnedMessages: [  
      {
        type: Schema.Types.ObjectId,
        ref: "Message"
      }
    ]
  },
  {
    timestamps: true
  }
);

export const Chat = mongoose.model("Chat", chatSchema);