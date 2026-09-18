import User from "../models/User.js";
import jwt from "jsonwebtoken";

// برای احراز هویت توکن JWT
export const authenticateToken = async (req, res, next) => {
    try {
        //*را از درخواست بگیر authorization  هدر 
        const authHeader = req.headers["authorization"];
        //* توکن را جدا کن
        //* authHeader &&: اگر هدر وجود داشت...
        //* هدر را با فاصله جدا کن
        //* split(" ")[1] --> هدر را با فاصله جدا کن (نتیجه: فقط خود توکن باقی می‌ماند: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "توکنی ارائه نشده است، دسترسی رد شد"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                message: "توکن نامعتبر است یا کاربر دیگر وجود ندارد"
            });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error("خطای احراز هویت JWT:", error);
        return res.status(401).json({
            message: "توکن نامعتبر است"
        });
    }
}

// میان‌افزار برای مجوز دادن به نقش‌های خاص
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "دسترسی ممنوع"
            });
        }
        next();
    }
}