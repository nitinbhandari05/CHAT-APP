import dotenv from "dotenv";
dotenv.config();

import fs from "fs";

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const { v2: cloudinary } = await import("cloudinary");

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        console.log("CLOUDINARY ERROR:", error);

        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};

export { uploadOnCloudinary };
