import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import chatRouter from "./routes/chat.route.js";
import messageRouter from "./routes/message.route.js";
import notificationRouter from "./routes/notification.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}));

app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/notifications", notificationRouter);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal server error",
        errors: err.errors || []
    });
});

export default app;
