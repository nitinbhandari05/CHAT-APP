import { Server } from "socket.io";

let io;
const onlineUsers = new Map();

const broadcastOnlineUsers = () => {
    if (!io) {
        return;
    }

    io.emit("online users", Array.from(onlineUsers.keys()));
};

const registerUserSocket = (userId, socketId) => {
    const key = String(userId);
    const sockets = onlineUsers.get(key) || new Set();
    sockets.add(socketId);
    onlineUsers.set(key, sockets);
    broadcastOnlineUsers();
};

const unregisterUserSocket = (userId, socketId) => {
    const key = String(userId);
    const sockets = onlineUsers.get(key);

    if (!sockets) {
        return;
    }

    sockets.delete(socketId);

    if (!sockets.size) {
        onlineUsers.delete(key);
    } else {
        onlineUsers.set(key, sockets);
    }

    broadcastOnlineUsers();
};

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

        socket.on("setup", (userData = {}) => {
            const userId = userData?._id || userData?.userId || userData?.id;

            if (!userId) {
                return;
            }

            socket.data.userId = String(userId);
            socket.join(String(userId));
            registerUserSocket(userId, socket.id);
            socket.emit("connected", {
                userId: String(userId),
                onlineUsers: Array.from(onlineUsers.keys())
            });
        });

        socket.on("join chat", (room) => {
            if (!room) {
                return;
            }

            socket.join(String(room));
        });

        socket.on("typing", (payload) => {
            const room = payload?.chatId || payload?.room || payload;

            if (!room) {
                return;
            }

            socket.to(String(room)).emit("typing", payload);
        });

        socket.on("stop typing", (payload) => {
            const room = payload?.chatId || payload?.room || payload;

            if (!room) {
                return;
            }

            socket.to(String(room)).emit("stop typing", payload);
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
            const userId = socket.data.userId;

            if (userId) {
                unregisterUserSocket(userId, socket.id);
            }

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
