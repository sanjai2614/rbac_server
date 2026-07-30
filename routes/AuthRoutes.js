import express from "express";
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  register,
  resendVerificationEmail,
  resetPassword,
  verifyEmail,
} from "../controllers/AuthController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.patch("/change-password", verifyToken, changePassword);

// verify email
router.post("/verify-email/:token",verifyEmail)

// resend verify email
router.post('/resend-verification',resendVerificationEmail)

// send email
router.post("/forgot-password", forgotPassword)

// reset link
router.post('/reset-password/:token',resetPassword)



export default router;
