import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    searchUsers
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// test route
router.get("/", (req, res) => {
    res.send("User route working 🚀");
});

// public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// protected routes
router.get("/search", verifyJWT, searchUsers);
router.post("/logout", verifyJWT, logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/change-password", verifyJWT, changeCurrentPassword);
router.get("/current-user", verifyJWT, getCurrentUser);

export default router;
