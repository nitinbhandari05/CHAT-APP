import mongoose from "mongoose";
import fs from "fs";

const SOCKET_URI = "mongodb://%2Fprivate%2Ftmp%2Fmongodb-27017.sock/MyChatApp";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000
        });

        console.log(
            `Database connected successfully ✅ ${connectionInstance.connection.host}`
        );
    } catch (error) {
        const shouldTrySocket =
            typeof process.env.MONGO_URI === "string" &&
            /127\.0\.0\.1|localhost/.test(process.env.MONGO_URI) &&
            fs.existsSync("/private/tmp/mongodb-27017.sock");

        if (shouldTrySocket) {
            try {
                const connectionInstance = await mongoose.connect(SOCKET_URI, {
                    serverSelectionTimeoutMS: 5000,
                    connectTimeoutMS: 5000
                });

                console.log(
                    `Database connected successfully ✅ ${connectionInstance.connection.host}`
                );

                return;
            } catch (socketError) {
                console.error("DB connection error:", socketError);
                throw socketError;
            }
        }

        console.error("DB connection error:", error);
        throw error;
    }
};

export default connectDB;
