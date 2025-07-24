import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Employee from '../models/Employee.js';
import Paralegal from '../models/Paralegal.js';
import verifyJWT from '../middleware/authMiddleware.js';

const router = Router();

// --- HELPER FUNCTION ---
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        // This will be caught by asyncHandler if used in routes
        throw new Error("Something went wrong while generating tokens");
    }
};

// --- COOKIE OPTIONS ---
// Since we use the Render Rewrite Rule, the browser sees a single site.
// 'lax' is the correct, more secure setting for this setup.
const COOKIE_OPTS = {
  httpOnly: true,
  secure: true, // Render is always HTTPS
  sameSite: 'lax', 
  maxAge: 24 * 60 * 60 * 1000 // 1 day for refresh token
};

// =========================================================
//                      PUBLIC ROUTES
// =========================================================

// --- REGISTER USER ---
router.post('/register', async (req, res, next) => {
  const { fullName, email, password, aadhaarNumber, role, ...details } = req.body;
  if (!fullName || !email || !password || !role || !aadhaarNumber) {
    return res.status(400).json({ success: false, message: 'All core fields are required' });
  }
  try {
    if (await User.findOne({ email, isDeleted: false })) {
        return res.status(409).json({ success: false, message: 'Email is already registered' });
    }
    if (await User.findOne({ aadhaarNumber, isDeleted: false })) {
        return res.status(409).json({ success: false, message: 'Aadhaar is already registered' });
    }
    
    const newUser = new User({ fullName, email, password, role, aadhaarNumber, ...details });
    await newUser.save();

    switch (role) {
      case 'admin': await Admin.create({ user: newUser._id, ...details }); break;
      case 'employee': await Employee.create({ user: newUser._id, ...details }); break;
      case 'paralegal': await Paralegal.create({ user: newUser._id, ...details }); break;
    }

    // After registration, immediately log them in by generating tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(newUser._id);
    const registeredUser = await User.findById(newUser._id).select("-password -refreshToken");
    
    return res
      .status(201)
      .cookie("accessToken", accessToken, COOKIE_OPTS)
      .cookie("refreshToken", refreshToken, COOKIE_OPTS)
      .json({ success: true, data: { user: registeredUser }, message: "Registration successful" });

  } catch (err) { next(err); }
});

// --- LOGIN USER ---
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }
  try {
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
      return res.status(404).json({ success: false, message: "User does not exist" });
    }
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    
    return res
        .status(200)
        .cookie("accessToken", accessToken, COOKIE_OPTS)
        .cookie("refreshToken", refreshToken, COOKIE_OPTS)
        .json({ success: true, data: { user: loggedInUser }, message: "Login successful" });
  } catch (err) { next(err); }
});

// --- REFRESH ACCESS TOKEN ---
router.post('/refresh-token', async (req, res, next) => {
    const incomingRefreshToken = req.cookies.refreshToken;
    if (!incomingRefreshToken) {
        return res.status(401).json({ success: false, message: "Unauthorized: No refresh token provided" });
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);
        if (!user || incomingRefreshToken !== user?.refreshToken) {
            return res.status(401).json({ success: false, message: "Refresh token is invalid or has been used" });
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, COOKIE_OPTS)
            .cookie("refreshToken", newRefreshToken, COOKIE_OPTS)
            .json({ success: true, data: {}, message: "Access token refreshed successfully" });
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }
});


// =========================================================
//                   MIDDLEWARE BARRIER
//       All routes below this line are now protected
// =========================================================
router.use(verifyJWT);

// --- LOGOUT USER ---
router.post('/logout', async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } }, { new: true });
        
        return res
            .status(200)
            .clearCookie("accessToken", COOKIE_OPTS)
            .clearCookie("refreshToken", COOKIE_OPTS)
            .json({ success: true, data: {}, message: "User logged out successfully" });
    } catch(err) { next(err); }
});

// --- GET CURRENT LOGGED-IN USER ---
router.get('/current-user', (req, res) => {
    return res.status(200).json({ success: true, data: req.user, message: "Current user fetched successfully" });
});


export default router;