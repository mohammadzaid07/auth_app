import User from "../models/user.js";
import sgMail from "@sendgrid/mail";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import authmiddleware from "../middleware/authmiddleware.js";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_KEY;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Utility: Generate a 6-digit OTP as string
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Utility: Generic email template generator for OTP emails
// THIS IS THE MISSING FUNCTION!
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

// Utility: Email template for registration success with patterns (no password)
const generateCredentialsEmailTemplate = (name, email, colorPassword, graphicalPassword) => {
  const colorDivs = colorPassword.map(color =>
    `<div style="width: 25px; height: 25px; background-color: ${color}; border-radius: 50%; display: inline-block; margin-right: 5px; border: 1px solid #ccc;"></div>`
  ).join('');

  const imageList = graphicalPassword.map(image => `<li>${image.split('.')[0]}</li>`).join('');

  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
    <h2 style="color: #4f46e5; text-align: center;">Welcome to the Multi-Factor Auth System, ${name}!</h2>
    <p style="font-size: 16px; color: #333;">Your account has been successfully created and verified. Here are your chosen patterns for your records.</p>

    <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin-top: 20px;">
      <h3 style="color: #333;">Your Login Credentials:</h3>
      <p style="font-size: 14px; color: #555;"><strong>Email:</strong> ${email}</p>

      <h3 style="margin-top: 20px; color: #333;">Your Color Pattern:</h3>
      <div style="display: flex; align-items: center;">${colorDivs}</div>

      <h3 style="margin-top: 20px; color: #333;">Your Image Pattern Order:</h3>
      <ol style="font-size: 14px; color: #555; padding-left: 20px;">${imageList}</ol>
    </div>

    <p style="font-size: 14px; color: #666; margin-top: 20px;">You can now log in using your credentials.</p>
    <hr style="margin: 20px 0;" />
    <p style="font-size: 12px; color: #999;">If you did not create this account, please contact our support team immediately.</p>
  </div>
  `;
};

// Register user and send OTP email for email verification
const register = async (req, res) => {
  try {
    const { name, email, password, graphicalPassword, colorPassword } = req.body;

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
      graphicalPassword,
      colorPassword,
      otp,
      otpExpiry,
      isVerified: false,
    });
    await user.save();

    // Prepare and send OTP email (now generateOtpEmailTemplate is defined)
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

    // Store patterns to send in email
    const colorPattern = user.colorPassword;
    const imagePattern = user.graphicalPassword;

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // After saving, send the credentials email (without the password)
    const htmlMessage = generateCredentialsEmailTemplate(
      user.name,
      user.email,
      colorPattern,
      imagePattern
    );

    const msg = {
      to: email,
      from: "mohdzaid07091997@gmail.com", // Your verified SendGrid sender
      subject: "Welcome! Your Account is Verified",
      html: htmlMessage,
    };

    await sgMail.send(msg);

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

    // Prepare and send resend OTP email (now generateOtpEmailTemplate is defined)
    const htmlMessage = generateOtpEmailTemplate(
      "", // Name is not required for resend, or you could fetch user.name
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

// Match OTP for login only for registered users
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

    // Email template for login OTP (now generateOtpEmailTemplate is defined)
    const htmlMessage = generateOtpEmailTemplate(
      user.name || "",  // fallback in case name is missing
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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // To prevent user enumeration, we send a generic success message
      return res.json({ message: "If your email is registered, you will receive a password reset OTP." });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minute expiry
    await user.save();

    const htmlMessage = generateOtpEmailTemplate(
      user.name,
      otp,
      "Password Reset OTP",
      "Please use the following OTP to reset your password. This OTP is valid for 10 minutes:",
      10
    );

    const msg = {
      to: email,
      from: "mohdzaid07091997@gmail.com",
      subject: "Your Password Reset OTP",
      html: htmlMessage,
    };

    await sgMail.send(msg);

    res.json({ message: "If your email is registered, you will receive a password reset OTP." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Error processing request" });
  }
};

const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, password, colorPassword, graphicalPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }
    if (user.otp !== otp || new Date(user.otpExpiry) < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update all credentials
    user.password = hashedPassword;
    user.colorPassword = colorPassword;
    user.graphicalPassword = graphicalPassword;

    // Clear the OTP fields
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.json({ message: "Your password and patterns have been reset successfully." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};

// Verify color password
const verifyColorPassword = async (req, res) => {
  try {
    const { email, colorPassword } = req.body;
    if (!email || !colorPassword) {
      return res
        .status(400)
        .json({ message: "Email and color password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch =
      JSON.stringify(user.colorPassword) === JSON.stringify(colorPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid color password" });
    }

    res.json({ message: "Color password verified successfully" });
  } catch (error) {
    console.error("Error verifying color password:", error);
    res.status(500).json({
      message: "Error verifying color password",
      error: error?.message,
    });
  }
};

// Verify graphical password (and issue token on final success)
const verifyGraphicalPassword = async (req, res) => {
  try {
    const { email, graphicalPassword } = req.body;
    if (!email || !graphicalPassword) {
      return res
        .status(400)
        .json({ message: "Email and graphical password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch =
      JSON.stringify(user.graphicalPassword) ===
      JSON.stringify(graphicalPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid graphical password" });
    }

    // If graphical password is correct, generate and send the JWT token
    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 }); // 1 hour

    res.json({ message: "Graphical password verified successfully" });
  } catch (error) {
    console.error("Error verifying graphical password:", error);
    res.status(500).json({
      message: "Error verifying graphical password",
      error: error?.message,
    });
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
  forgotPassword,
  resetPasswordWithOtp,
  verifyGraphicalPassword,
  verifyColorPassword,
  logout,
  dashboard,
};