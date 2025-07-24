import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { connectDB } from "./config/db.js"
import { errorMiddleware } from "./middleware/errorMiddleware.js"
import authMiddleware from "./middleware/authMiddleware.js"

// Import all routes
import authRoutes from "./routes/authRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import citizenRoutes from "./routes/citizenRoutes.js"
import documentRoutes from "./routes/documentRoutes.js"
import employeeRoutes from "./routes/employeeRoutes.js"
import kioskRoutes from "./routes/kioskRoutes.js"
import legalIssueRoutes from "./routes/legalIssueRoutes.js"
import paralegalRoutes from "./routes/paralegalRoutes.js"
import subscriptionRoutes from "./routes/subscriptionRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import voiceQueryRoutes from "./routes/voiceQueryRoutes.js"

const app = express()
const PORT = process.env.PORT || 5001

// Parse CORS origins
const allowedOrigins = process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()) || []

if (allowedOrigins.length === 0) {
  console.error("FATAL ERROR: CORS_ORIGIN is not defined properly.")
  process.exit(1)
}

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl requests, etc.)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.log(`⛔ CORS blocked origin: ${origin}`)
      callback(new Error(`Not allowed by CORS: ${origin}`))
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}

// Middleware
app.use(cors(corsOptions))
app.set("trust proxy", 1)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())

// Routes
app.get("/", (req, res) => res.send("Backend is running."))

// API Routes
const apiRouter = express.Router()

// Health check
apiRouter.get("/", (req, res) => res.json({ message: "API is Live", timestamp: new Date().toISOString() }))

// Public routes (no auth required)
apiRouter.use("/auth", authRoutes) // FIXED: Added leading slash

// Protected routes (auth required)
apiRouter.use("/admins", authMiddleware, adminRoutes)
apiRouter.use("/citizens", authMiddleware, citizenRoutes)
apiRouter.use("/documents", authMiddleware, documentRoutes)
apiRouter.use("/employees", authMiddleware, employeeRoutes)
apiRouter.use("/kiosks", authMiddleware, kioskRoutes)
apiRouter.use("/issues", authMiddleware, legalIssueRoutes)
apiRouter.use("/paralegals", authMiddleware, paralegalRoutes)
apiRouter.use("/subscriptions", authMiddleware, subscriptionRoutes)
apiRouter.use("/users", authMiddleware, userRoutes)
apiRouter.use("/voicequeries", authMiddleware, voiceQueryRoutes)

// Mount API router
app.use("/api", apiRouter)

// Error handling middleware (must be last)
app.use(errorMiddleware)

// Start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server connected to DB and running at port ${PORT}`)
      console.log(`📍 Environment: ${process.env.NODE_ENV}`)
      console.log(`🌐 Allowed Origins: ${allowedOrigins.join(", ")}`)
    })
  })
  .catch((err) => {
    console.error("Failed to start server", err)
    process.exit(1)
  })
