import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,          
      unique: true,
      lowercase: true,         
      trim: true,
      index: true
    },

    email: {
      type: String,
      required: true,         
      unique: true,
      lowercase: true,
      trim: true
    },

    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true
      
    },

    avatar: {
      type: String,
      required: true
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false           
    },

    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user"
    },

    
    status: {                  
      type: String,
      enum: ["online", "offline"],
      default: "offline"
    },

    lastSeen: {                
      type: Date,
      default: Date.now
    },

    socketId: {              
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);


userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);