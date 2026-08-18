import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

// register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, err: "user already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    const user = await User.create({
      name,
      email,
      password: hashed,
      verificationToken,
      verificationTokenExpires,
    });
    const verifyLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify Your Email",
      html: `
    <h2>Welcome to RBAC App</h2>

    <p>Please verify your email.</p>

    <a href="${verifyLink}">
      Verify Email
    </a>
  `,
    });

    return res.status(201).json({
      success: true,
      msg: "user registered verify email to continue",
      user,
    });
  } catch (err) {
    return res.status(500).json({ success: false, err: err.message });
  }
};

// verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    // console.log("token",token);

    const user = await User.findOne({
      verificationToken: token,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        err: "Invalid verification link",
      });
    }
    if (user.verificationTokenExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        err: "Verification link has expired",
      });
    }

    user.isVerified = true;
    user.verificationToken = null;

    await user.save();

    return res.status(200).json({
      success: true,
      msg: "Email verified successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      err: err.message,
    });
  }
};

// resend verify
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        err: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        err: "Email is already verified",
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const verifyLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify Your Email",
      html: `
        <h2>Verify Your Email</h2>

        <p>Your previous verification link expired.</p>

        <p>Click the button below to verify your email.</p>

        <a href="${verifyLink}">
          Verify Email
        </a>
      `,
    });

    return res.status(200).json({
      success: true,
      msg: "Verification email sent successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      err: err.message,
    });
  }
};

// login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, err: "user not found" });
    }
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        err: "Please verify your email before logging in.",
        isVerified: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, err: "Invalid credentials" });
    }

    const JWT_Token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT,
      {
        expiresIn: "1d",
      },
    );
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("JWT_Token", JWT_Token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      msg: "login successfull",
      user,
    });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};

// logout
export const logout = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("JWT_Token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      msg: "Logged out successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      err: err.message,
    });
  }
};

// change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    console.log("body", req.body);
    console.log("user", req.user);
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        err: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        err: "Current password is incorrect",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        err: "New password cannot be same as old password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    res.clearCookie("JWT_Token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      msg: "Password changed successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      err: err.message,
    });
  }
};

// forgot password
export const forgotPassword = async (req, res) => {
  try {
    // console.log("req", req.body)
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, err: "email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, err: "user not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    (await sendEmail({
      to: user.email,
      subject: "password reset",
      html: `
    <h2>Password Reset Request</h2>

    <p>Click the button below to reset your password.</p>

    <a href="${resetLink}">
      Reset Password
    </a>

    <p>This link expires in 15 minutes.</p>
  `,
    }),
      res.status(200).json({
        success: true,
        msg: "Password reset link sent successfully",
      }));
  } catch (err) {
    res.status(500).json({ success: false, err: err.message });
  }
};

// reset password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    console.log("body", req.body);
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        err: "Token and password are required",
      });
    }

    const user = await User.findOne({ resetPasswordToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        err: "Invalid reset token",
      });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        err: "Reset token has expired",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      msg: "Password reset successful",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      err: err.message,
    });
  }
};
