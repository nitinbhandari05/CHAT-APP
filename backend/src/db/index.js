import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGO_URI);

        console.log(
            `Database connected successfully ✅ ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.error("DB connection error:", error);
        throw error;
    }
};

export default connectDB;
