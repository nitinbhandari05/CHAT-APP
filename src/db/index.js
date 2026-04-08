const connectDB = async () => {
    try {
        console.log("Database connected successfully ✅");
    } catch (error) {
        console.error("DB connection error:", error);
        process.exit(1);
    }
};

export default connectDB;