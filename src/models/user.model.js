import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false
    },

    refreshToken: {
      type: String,
      default: null,
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
  if (!password || !this.password) {
    return false;
  }

  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d"
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d"
    }
  );
};

export const User = mongoose.model("User", userSchema);
