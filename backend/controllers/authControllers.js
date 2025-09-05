import User from "../models/user.js";
import sgMail from "@sendgrid/mail";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import authmiddleware from "../middleware/authmiddleware.js";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = "f3b4230dbac3956955afbc6fdbc6b55d974f6e6f9437d3a343e5e18390cfe6ea";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Utility: Generate a 6-digit OTP as string
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Utility: Generic email template generator for OTP emails
const generateOtpEmailTemplate = (name, otp, subject = "OTP Verification", message = "", expiryMinutes = 10) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
    <h2 style="color: #4f46e5; text-align: center;">${subject} ${name ? `- Hello, ${name}!` : ""}</h2>
    <p style="font-size: 16px; color: #333;">${message || "Please use the OTP below to complete your request:"}</p>
    <div style="text-align: center; margin: 20px 0;">
      <span style="display: inline-block; padding: 15px 25px; font-size: 24px; font-weight: bold; background-color: #4f46e5; color: #fff; border-radius: 8px;">${otp}</span>
    </div>
    <p style="font-size: 14px; color: #666;">This OTP will expire in ${expiryMinutes} minutes.</p>
    <hr style="margin: 20px 0;" />
    <p style="font-size: 12px; color: #999;">If you did not request this, please ignore this email.</p>
  </div>
`;

// Register user and send OTP email for email verification
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Hash password and generate OTP with expiry
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Create new user with OTP and verification status
    user = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpiry,
      isVerified: false,
    });
    await user.save();

    // Prepare and send OTP email
    const htmlMessage = generateOtpEmailTemplate(
      name,
      otp,
      "OTP Verification",
      "Thank you for signing up. Please verify your email address by entering the OTP below:",
      10
    );

    const msg = {
      to: email,
      from: "mohdzaid07091997@gmail.com",
      subject: "OTP Verification",
      html: htmlMessage,
    };

    await sgMail.send(msg);

    res.status(201).json({ message: "User registered. Please verify OTP sent to email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering user", error });
  }
};

// Verify OTP and activate user account
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    if (!user.otpExpiry || new Date(user.otpExpiry) < new Date()) return res.status(400).json({ message: "OTP expired" });

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    res.status(500).json({
      message: "Error verifying OTP",
      error: error?.message || error?.stack || JSON.stringify(error),
    });
  }
};

// Resend OTP for verification with updated OTP and expiry
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Prepare and send resend OTP email
    const htmlMessage = generateOtpEmailTemplate(
      "",
      otp,
      "Resend OTP Verification",
      "Your new OTP for verifying your account is:",
      10
    );

    const msg = {
      to: email,
      from: "mohdzaid07091997@gmail.com",
      subject: "Resend OTP Verification",
      text: `Your new OTP is ${otp}. It will expire in 10 minutes.`,  // plain text fallback
      html: htmlMessage,  // proper HTML email
    };


    await sgMail.send(msg);

    res.json({ message: "OTP resent successfully." });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ message: "Error resending OTP", error });
  }
};

// Match OTP for use cases where verification is not required yet
const matchOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    if (!user.otpExpiry || new Date(user.otpExpiry) < new Date()) return res.status(400).json({ message: "OTP expired" });

    // OTP matches, but no verification performed
    res.json({ message: "OTP matched" });
  } catch (error) {
    console.error("Error in matchOTP:", error);
    res.status(500).json({
      message: "Error matching OTP",
      error: error?.message || error?.stack || JSON.stringify(error),
    });
  }
};

// Login user and send an OTP for login authentication
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate and save OTP for login verification
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Email template for login OTP
    const htmlMessage = generateOtpEmailTemplate(
      user.name || "",   // fallback in case name is missing
      otp,
      "Login OTP Verification",
      "You requested to log in. Please use the OTP below to complete authentication.",
      10
    );

    const msg = {
      to: email,
      from: "mohdzaid07091997@gmail.com",
      subject: "Login OTP Verification",
      text: `Your login OTP is ${otp}. It will expire in 10 minutes.`,  // plain text fallback
      html: htmlMessage,  // proper HTML email
    };


    await sgMail.send(msg);

    res.json({ message: "OTP sent to email", email });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error during login", error });
  }
};

// Logout user by clearing token cookie
const logout = (req, res) => {
  try {
    res.clearCookie("token"); // Clear JWT token cookie
    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out", error });
  }
};

// Protected dashboard route, returns user info excluding password
const dashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Welcome to the dashboard",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard", error });
  }
};

export default {
  register,
  verifyOTP,
  resendOTP,
  matchOTP,
  login,
  logout,
  dashboard,
};
