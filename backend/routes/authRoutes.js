import express from "express";
import authController from "../controllers/authControllers.js";
import authMiddleware from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/verify-otp", authController.verifyOTP);
router.post("/resend-otp", authController.resendOTP);
router.post("/match-otp", authController.matchOTP);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/dashboard", authMiddleware, authController.dashboard);

export default router;