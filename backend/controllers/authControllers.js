import User from "../models/user.js";
import sgMail from "@sendgrid/mail";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import authmiddleware from "../middleware/authmiddleware.js";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY =
  "f3b4230dbac3956955afbc6fdbc6b55d974f6e6f9437d3a343e5e18390cfe6ea";

// sgMail.setApiKey('Add SG API Here');
console.log("SendGrid API Key:", process.env.SENDGRID_API_KEY);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Generate OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Register User and Send OTP
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpiry,
      isVerified: false,
    });
    await user.save();

    // HTML Email Template
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #4f46e5; text-align: center;">Welcome to Our Platform, ${name}!</h2>
        <p style="font-size: 16px; color: #333;">Thank you for signing up. Please verify your email address by entering the OTP below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="display: inline-block; padding: 15px 25px; font-size: 24px; font-weight: bold; background-color: #4f46e5; color: #fff; border-radius: 8px;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #666;">This OTP will expire in 10 minutes.</p>
        <hr style="margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    const msg = {
      to: email,
      from: "mohdzaid07091997@gmail.com",
      subject: "OTP Verification",
      html: htmlMessage,
    };

    await sgMail.send(msg);

    res
      .status(201)
      .json({ message: "User registered. Please verify OTP sent to email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering user", error });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "User already verified" });

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (!user.otpExpiry || new Date(user.otpExpiry) < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

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

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "User already verified" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const msg = {
      to: email,
      from: "mohdzaid07091997@gmail.com",
      subject: "Resend OTP Verification",
      text: `Your new OTP is: ${otp}`,
    };
    await sgMail.send(msg);

    res.json({ message: "OTP resent successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error resending OTP", error });
  }
};

const matchOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Match OTP only
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.otpExpiry || new Date(user.otpExpiry) < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Don't verify the user, just match OTP
    res.json({ message: "OTP matched" });
  } catch (error) {
    console.error("Error in matchOTP:", error);
    res.status(500).json({
      message: "Error matching OTP",
      error: error?.message || error?.stack || JSON.stringify(error),
    });
  }
};

// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "User not found" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(400).json({ message: "Incorrect password" });

//     if (!user.isVerified) {
//       return res
//         .status(400)
//         .json({ message: "Email not verified. Please verify OTP." });
//     }

//     const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
//       expiresIn: "1h",
//     });

//     res.cookie("token", token, {
//       httpOnly: true, // Prevents access via JavaScript
//       secure: process.env.NODE_ENV === "production", // Secure in production
//       sameSite: "Strict", // Prevent CSRF attacks
//       maxAge: 60 * 60 * 1000, // 1 hour
//     });

//     res.json({
//       message: "Login successful",
//       token,
//     });
//   } catch (error) {
//     console.error("Error in login:", error);
//     res.status(500).json({
//       message: "Error logging in",
//       error: error?.message || error?.stack || JSON.stringify(error),
//     });
//   }
// };

// Logout User

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check password (assuming bcrypt)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate OTP for every login
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    // Send OTP email
    const msg = {
      to: email,
      from: "mohdzaid07091997@gmail.com",
      subject: "Login OTP Verification",
      text: `Your OTP for login is: ${otp}`,
    };
    await sgMail.send(msg);

    res.json({ message: "OTP sent to email", email }); // send email to frontend
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error during login", error });
  }
};

const logout = (req, res) => {
  try {
    res.clearCookie("token"); // Remove the JWT cookie
    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out", error });
  }
};

// Dashboard (Protected Route)
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

// Export all controllers as a default object
export default {
  register,
  verifyOTP,
  resendOTP,
  matchOTP,
  login,
  logout,
  dashboard,
};
