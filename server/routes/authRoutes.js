import express from 'express';
import { completeProfile, loginUser, registerAdmin,  registerUser, verifyOtp, getProfile,updateProfile, getUsers} from '../controllers/authController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const authRouter = express.Router();

// ============ مسیرهای عمومی ============
authRouter.post('/register', registerUser);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/complete-profile", completeProfile);
authRouter.post("/login", loginUser);

// ============ مسیرهای محافظت‌شده ============
authRouter.get("/me", authenticateToken, getProfile);
authRouter.put("/update-profile", authenticateToken, updateProfile);

// ============ مسیرهای مخصوص مدیر ============
authRouter.post("/register-admin", authenticateToken,authorizeRoles("admin"),  registerAdmin);
authRouter.get("/users", authenticateToken, authorizeRoles("admin"), getUsers);

export default authRouter;