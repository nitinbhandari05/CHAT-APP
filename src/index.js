import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
    path: './.env'
});

connectDB()
.then(() => {
    app.listen(process.env.PORT || 5050, () => {
        console.log(`Server is running at port: ${process.env.PORT || 5050}`);
    });
})
.catch((err) => {
    console.log("Server startup failed:", err);
});