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
];

// ✅ Use regex to allow all Vercel preview deployments for your project
const vercelPreviewRegex = /^https:\/\/auth-app-.*-mohammad-zaid-07\.vercel\.app$/;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow mobile apps, curl, Postman
      if (
        allowedOrigins.includes(origin) ||
        vercelPreviewRegex.test(origin)
      ) {
        callback(null, true);
      } else {
        console.warn("Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Handle preflight explicitly
app.options("*", cors());

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
