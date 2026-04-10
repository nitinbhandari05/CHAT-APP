import { Server } from "socket.io";

let io;

const initializeSocketIO = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || "*",
            credentials: true
        },
        pingTimeout: 60000
    });

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on("setup", (userData) => {
            if (!userData?._id) {
                return;
            }

            socket.join(userData._id);
            socket.emit("connected");
        });

        socket.on("join chat", (room) => {
            if (!room) {
                return;
            }

            socket.join(room);
        });

        socket.on("typing", (room) => {
            socket.to(room).emit("typing");
        });

        socket.on("stop typing", (room) => {
            socket.to(room).emit("stop typing");
        });

        socket.on("new message", (newMessage) => {
            const chat = newMessage?.chat;
            const users = chat?.users;

            if (!Array.isArray(users)) {
                return;
            }

            users.forEach((user) => {
                const userId = user?._id?.toString?.() || user?.toString?.();

                if (!userId || userId === newMessage?.sender?._id?.toString?.()) {
                    return;
                }

                socket.to(userId).emit("message received", newMessage);
            });
        });

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized yet");
    }

    return io;
};

const emitSocketEvent = ({ room, event, data }) => {
    if (!io || !room || !event) {
        return false;
    }

    io.to(room.toString()).emit(event, data);
    return true;
};

export {
    emitSocketEvent,
    initializeSocketIO,
    getIO
};
