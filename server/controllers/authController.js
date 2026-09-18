import User from "../models/User.js";
import otpGenerator from 'otp-generator';          
import sendOtp from "../utils/sendOTP.js";
import bcrypt from 'bcryptjs';

//* ابزار تولید شناسه‌های یکتای تصادفی - یک رشته‌ی تصادفی و منحصربه‌فرد می‌دهد که هیچ‌وقت تکراری نمی‌شود
//* مثلا --> a3bb189e-8bf9-3888-9912-ace4e6543002
import { v4 as uuidv4 } from 'uuid';

//* JWT --> برای احراز هویت کاربر استفاده می‌شود
import jwt from 'jsonwebtoken';

// مرحله اول ثبت‌نام دانشجو: ثبت کاربر و ارسال کد تایید
export async function registerUser(req, res) {
    try {
        const { name, email, phone, password } = req.body;

        if (!email) return res.status(400).json({ message: 'وارد کردن ایمیل الزامی است' });

        //* در جاوااسکریپت، وقتی می‌خواهیم یک الگوی رجکس بنویسیم، آن را بین دو اسلش قرار می‌دهیم
        //* \D --> یعنی هر چیزی که رقم نیست (غیرعددی)
        //* g --> رشته را بگرد و همه کاراکترهای غیرعددی را پیدا کن
        //* replace("") --> هر چیزی که پیدا کردی (کاراکترهای غیرعددی) را با هیچ چیز (رشته خالی) جایگزین کن
        //* مثلا --> phone = "+1 (555) 123-4567" --> "15551234567"
        const cleanPhone = phone ? phone.toString().replace(/\D/g, "") : "";
        if (cleanPhone.length !== 10) {
            return res.status(400).json({
                message: "شماره موبایل باید دقیقاً ۱۰ رقم باشد"
            });
        }

        // ✅ findOne به جای find (چون find آرایه برمی‌گرداند و همیشه truthy است)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (existingUser.isVerified) return res.status(400).json({
                message: "کاربری با این اطلاعات از قبل وجود دارد"
            });
            await User.deleteOne({ email });
        }

        // ✅ otpGenerator.generate به جای generate
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false, 
            lowerCaseAlphabets: false,
            specialChars: false
        });

        //* از طریق ایمیل OTP ارسال کد
        try {
            await sendOtp(email, otp);
        } catch (emailError) {
            console.error("خطا در ارسال ایمیل کد تایید:", emailError);
            return res.status(500).json({
                message: "ارسال ایمیل کد تایید ناموفق بود. لطفاً دوباره تلاش کنید."
            });
        }

        // ✅ فقط یک بار هش کردن (تکراری حذف شد)
        const hashedPassword = await bcrypt.hash(password, 10);

        //* تاریخ و زمانی بساز که دقیقاً ۵ دقیقه بعد از الان باشد
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        const studentId = `ST-${uuidv4().slice(0, 8).toUpperCase()}`;

        const user = await User.create({
            name, 
            email, 
            phone: cleanPhone, 
            password: hashedPassword, 
            otp, 
            otpExpiry, 
            studentId
        });

        res.status(201).json({
            message: "کاربر با موفقیت ثبت‌نام شد، کد تایید به ایمیل ارسال شد",
            user
        });

    } catch (error) {
        console.error("خطا در ثبت‌نام کاربر:", error);
        res.status(500).json({ message: "خطا در ثبت‌نام کاربر", error: error.message });
    }
}

// مرحله ۲: تایید کد OTP
export async function verifyOtp(req, res) {
    try {
        const { email, otp } = req.body;
        if (!email) return res.status(400).json({ message: "ایمیل الزامی است." });

        //* جستجو می‌کند و اولین کاربری که ایمیلش با email مطابقت دارد را برمی‌گرداند
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "کاربر پیدا نشد" });

        if (user.otp !== otp || new Date() > new Date(user.otpExpiry)) {
            return res.status(400).json({
                message: "کد تایید نامعتبر یا منقضی شده است"
            });
        }

        //* Object.assign --> مقادیر آبجکت دوم را روی آبجکت اول کپی می‌کند
        //* isVerified: true → حساب کاربر تایید شد
        //* otp: null → کد OTP پاک شد (دیگر لازم نیست)
        //* otpExpiry: null → زمان انقضا هم پاک شد
        Object.assign(user, { isVerified: true, otp: null, otpExpiry: null });
        await user.save();

        res.status(200).json({ message: "کد تایید با موفقیت بررسی شد" });

    } catch (error) {
        console.error("خطا در بررسی کد تایید:", error);
        res.status(500).json({
            message: "خطا در بررسی کد تایید",
            error: error.message
        });
    }
}

// مرحله ۳: تکمیل پروفایل
export async function completeProfile(req, res) {
    try {
        const { email, department, stream, semester, year, rollNo } = req.body;

        if (!email) return res.status(400).json({ message: "ایمیل الزامی است" });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "کاربر پیدا نشد" });

        if (!user.isVerified) return res.status(400).json({
            message: "کاربر تایید نشده است"
        });

        //* اطلاعات دانشکده، رشته، ترم، سال، شماره دانشجویی و وضعیت "پروفایل کامل شده" را روی آبجکت کاربر اعمال کن
        Object.assign(user, { 
            department, 
            stream, 
            semester, 
            year, 
            rollNo, 
            isProfileComplete: true 
        });
        await user.save();

        res.status(200).json({
            message: "پروفایل با موفقیت تکمیل شد"
        });

    } catch (error) {
        console.error("خطا در تکمیل پروفایل:", error);
        res.status(500).json({
            message: "خطا در تکمیل پروفایل",
            error: error.message
        });
    }
}

// ورود به عنوان دانشجو یا مدیر
export async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "ایمیل و رمز عبور الزامی هستند"
            });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "کاربر پیدا نشد" });

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "لطفاً قبل از ورود، ایمیل خود را با کد OTP تایید کنید."
            });
        }

        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({
                success: false,
                message: "اطلاعات ورود نامعتبر است"
            });
        }

        //* JWT_SECRET --> یک توکن JWT بساز که حاوی شناسه کاربر و نقش او باشد و با کلید مخفی (JWT_SECRET) امضا شود
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        //* user.toObject() --> آبجکت کاربر را به یک آبجکت ساده جاوااسکریپت تبدیل کن
        //* const { password: _, ...userResponse } --> رمز عبور را در متغیری به نام _ بریز و بقیه فیلدها را در userResponse نگه دار
        const { password: _, ...userResponse } = user.toObject();

        res.status(200).json({
            success: true,
            token,
            user: userResponse
        });

    } catch (error) {
        console.error("خطا در هنگام ورود:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// دریافت پروفایل کاربر فعلی (من)
export async function getProfile(req, res) {
    try {
        //* select("-password") --> رمز هش‌شده کاربر برای فرانت‌اند ارسال نمی‌شود
        //* req.user._id --> این فیلد توسط میان‌افزار احراز هویت پر می‌شود
        const user = await User.findById(req.user._id).select("-password");
        if (!user) return res.status(404).json({ message: "کاربر پیدا نشد" });

        res.status(200).json({ success: true, user });

    } catch (error) {
        console.error("خطا در دریافت پروفایل کاربر:", error);
        res.status(500).json({
            message: "خطا در دریافت پروفایل کاربر",
            error: error.message
        });
    }
}

//* ویرایش پروفایل کاربر
export async function updateProfile(req, res) {
    try {
        const { name, email, phone, department, stream, semester, academicYear, rollNumber } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: "کاربر پیدا نشد" });

        if (email) {
            const normalizedEmail = email.trim().toLowerCase();
            if (normalizedEmail !== user.email.toLowerCase()) {
                // اگر کاربر نقش "user" (دانشجو) داشته باشد
                if (user.role === "user") {
                    return res.status(400).json({ 
                        message: "دانشجویان مجاز به تغییر آدرس ایمیل خود نیستند" 
                    });
                }
                // بررسی تکراری نبودن ایمیل جدید
                if (await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } })) {
                    return res.status(400).json({ message: "این ایمیل قبلاً استفاده شده است" });
                }
                user.email = normalizedEmail;
            }
        }

        if (phone) {
            const cleanPhone = phone.toString().replace(/\D/g, "");
            if (cleanPhone.length !== 10) {
                return res.status(400).json({ message: "شماره موبایل باید دقیقاً ۱۰ رقم باشد" });
            }
            user.phone = cleanPhone;
        }

        if (name) user.name = name;
        if (department) user.department = department;
        if (stream) user.stream = stream;
        if (semester) user.semester = semester;
        if (academicYear) user.year = academicYear;
        if (rollNumber) user.rollNo = rollNumber;

        await user.save();

        res.status(200).json({
            success: true,
            message: "پروفایل با موفقیت به‌روزرسانی شد",
            user
        });

    } catch (error) {
        console.error("خطا در به‌روزرسانی پروفایل:", error);
        res.status(500).json({
            message: "خطا در به‌روزرسانی پروفایل",
            error: error.message
        });
    }
}

// دریافت تمام حساب‌های دانشجویان (مدیر)
export async function getUsers(req, res) {
    try {
        const users = await User.find({ 
            role: "user", 
            isVerified: true, 
            isProfileComplete: true 
        }).select("-password");

        res.status(200).json({ success: true, users });

    } catch (error) {
        console.error("خطا در دریافت دانشجویان:", error);
        res.status(500).json({ message: "خطا در دریافت دانشجویان", error: error.message });
    }
}

// برای ثبت‌نام مدیر
export async function registerAdmin(req, res) {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                message: "لطفاً تمام فیلدهای الزامی را وارد کنید."
            });
        }

        if (await User.findOne({ email })) {
            return res.status(400).json({
                message: "کاربری با این ایمیل از قبل وجود دارد"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email: email.trim().toLowerCase(),
            phone,
            password: hashedPassword,
            role: "admin",
            isVerified: true
        });

        const { password: _, ...userResponse } = user.toObject();

        res.status(201).json({
            success: true,
            message: "مدیر با موفقیت ثبت‌نام شد!",
            user: userResponse
        });

    } catch (error) {
        console.error("خطا در ثبت‌نام مدیر:", error);
        res.status(500).json({ message: "خطا در ثبت‌نام مدیر", error: error.message });
    }
}