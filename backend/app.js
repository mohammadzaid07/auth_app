import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

// Connect to MongoDB
connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:3001",
  "https://auth-app-six-orpin.vercel.app",
  "https://auth-app-mohammad-zaid-07.vercel.app",
  "https://auth-app-git-main-mohammad-zaid-07.vercel.app",
  "https://auth-dpdoev8bc-mohammad-zaid-07.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g. mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


app.use(cookieParser());
app.use(express.json()); // Middleware to parse JSON

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

