import dotenv from "dotenv";
import http from "http";
import connectDB from "./db/index.js";
import app from "./app.js";
import { initializeSocketIO } from "./sockets/socket.js";

dotenv.config({
    path: './.env'
});

const startServer = (server, port, retriesLeft = 5) => {
    server.once("error", (error) => {
        if (error.code === "EADDRINUSE" && retriesLeft > 0) {
            const nextPort = port + 1;

            console.log(`Port ${port} is already in use, trying ${nextPort}...`);
            startServer(server, nextPort, retriesLeft - 1);
            return;
        }

        console.log("Server startup failed:", error);
        process.exit(1);
    });

    server.listen(port, () => {
        console.log(`Server is running at port: ${port}`);
    });
};

connectDB()
.then(() => {
    const port = Number(process.env.PORT) || 5051;
    const server = http.createServer(app);

    initializeSocketIO(server);

    startServer(server, port);
})
.catch((err) => {
    console.log("Server startup failed:", err);
});
