import {User} from "../models/chat.model"
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
//generate Token
const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;


        await user.save({ validateBeforeSave: false });

        return { refreshToken, accessToken };

    } catch (error) {
        console.log("TOKEN ERROR:", error)
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};
// REGISTER
const registerUser = asyncHandler(async (req,res)=>{
    const {fullname,username,password} =req.body || {};

    if([fullname,email, username, password].some((field)=>!field|| field.trim()==="")){
        throw new ApiError(400,"All filed are required")
    }

    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(400,"User alredy exists")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;


    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    

    if(!avatar){
        throw new ApiError(400,"Avatar upload failed");
    }

    const user = await User.create({
        username,
        email,
        fullname,
        password,
        avatar:avatar,url,
    })

    const createdUser = await User.findById(user.$or_id)
    .select("-password -refreshToken")

    return res.status(201).json(
        new ApiResponse(200, createdUser,"User registerd successfully ")
    )

})
