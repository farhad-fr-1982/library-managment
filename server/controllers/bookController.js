import User from "../models/User.js";
import FineSetting from "../models/FineSetting.js";
import Issue from "../models/Issue.js";
import { toJalaali } from "jalaali-js";

// ✅ تابع کمکی برای دو رقمی کردن اعداد
const pad = (n) => String(n).padStart(2, "0");

// ✅ تبدیل تاریخ به شمسی (فرمت: YYYY-MM-DD)
const getLocalIsoDate = (value = new Date()) => {
    const d = new Date(value);
    const gy = d.getFullYear();
    const gm = d.getMonth() + 1;
    const gd = d.getDate();

    const { jy, jm, jd } = toJalaali(gy, gm, gd);

    return `${jy}-${pad(jm)}-${pad(jd)}`;
};

// شروع روز (نیمه‌شب)
const getStartOfDay = (value) =>
    new Date(new Date(value).setHours(0, 0, 0, 0));

// اختلاف دو تاریخ به روز
const getDiffInDays = (targetDateString) =>
    Math.round((getStartOfDay(targetDateString) - getStartOfDay(new Date())) / 86400000);

// محاسبه تعداد واحدهای دیرکرد (روز/هفته/ماه/سال)
const getOverdueUnits = (overdueDays, interval) => {
    if (overdueDays <= 0) return 0;
    const divisor = { week: 7, month: 30, year: 365 }[interval] || 1;
    return Math.ceil(overdueDays / divisor);
};

// محاسبه جریمه
const calculateFine = (issue, fineRate = 10, fineInterval = "day") => {
    if (!issue || issue.fineCleared || issue.returnedOn) return 0;
    const overdueDays = Math.max(0, -getDiffInDays(issue.dueDate));
    return getOverdueUnits(overdueDays, fineInterval) * fineRate + (Number(issue.manualFine) || 0);
};

// امانت دستی کتاب‌ها به دانشجو
export async function issueManualBooks(req, res) {
    try {
        const { studentDetails, books } = req.body;
        if (!Array.isArray(books) || books.length === 0) {
            return res.status(400).json({ message: "هیچ کتابی وارد نشده است" })
        }

        // ✅ اصلاح شد: جستجو با email
        const student = await User.findOne({ email: studentDetails.userEmail });
        
        if (!student) return res.status(404).json({
            success: false,
            message: "دانشجو پیدا نشد"
        });

        const todayIso = getLocalIsoDate();
        const validBooks = books.filter(b => b.title && b.bookCode && b.dueDate);
        if (validBooks.length === 0) {
            return res.status(400).json({
                message: "لطفاً حداقل یک کتاب معتبر با کد کتاب و تاریخ سررسید وارد کنید"
            });
        }

        const createdIssues = await Promise.all(validBooks.map(book => Issue.create({
            source: "manual",
            bookCode: book.bookCode.trim(),
            title: book.title.trim(),
            userEmail: student.email,
            userName: student.name,
            issuedOn: todayIso,
            dueDate: book.dueDate,
            returnedOn: null,
            fineRate: Number(book.fineRate ?? req.body.fineRate ?? 10),
            fineInterval: book.fineInterval ?? req.body.fineInterval ?? "day",
            manualFine: 0,
            fineCleared: false,
            clearedFineAmount: 0,
            department: studentDetails.department?.trim() || student.department || "عمومی",
            stream: studentDetails.stream?.trim() || student.stream || "عمومی",
            year: studentDetails.academicYear?.trim() || student.year || "سال اول",
            semester: studentDetails.semester?.trim() || student.semester || "ترم ۱",
            rollNumber: studentDetails.rollNumber?.trim() || student.rollNo || "تعیین نشده",
            studentId: student.studentId || `ST-${student._id.toString().slice(-4)}`
        })));

        res.status(201).json({
            success: true,
            message: `${createdIssues.length} کتاب با موفقیت امانت داده شد!`,
            count: createdIssues.length,
            issues: createdIssues
        });

    }

    catch (error) {
        console.error("خطا در امانت دستی کتاب‌ها:", error);
        res.status(500).json({
            message: "خطا در امانت دستی کتاب‌ها",
            error: error.message
        });
    }
}

// دریافت تمام امانت‌های دستی (مدیر)
export async function getIssues(req, res) {
    try {
        const issues = await Issue.find({}).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            issues
        });
    }

    catch (error) {
        console.error("خطا در دریافت امانت‌های دستی:", error);
        res.status(500).json({
            message: "خطا در دریافت امانت‌های دستی",
            error: error.message
        });
    }
}

// دریافت امانت‌های دستی برای دانشجوی لاگین‌شده
export async function getStudentIssues(req, res) {
    try {
        const issues = await Issue.find({
            userEmail: req.user.email.toLowerCase()
        }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, issues });
    }

    catch (error) {
        console.error("خطا در دریافت امانت‌های دانشجو:", error);
        res.status(500).json({
            message: "خطا در دریافت امانت‌های دانشجو",
            error: error.message
        });
    }
}

// بازگشت کتاب امانت داده شده
export async function returnBook(req, res) {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: "رکورد امانت پیدا نشد" });

        if (issue.returnedOn) return res.status(400).json({
            message: "کتاب قبلاً بازگردانده شده است"
        });
        issue.returnedOn = getLocalIsoDate();
        await issue.save();
        res.status(200).json({
            success: true,
            message: "کتاب با موفقیت بازگردانده شد!",
            issue
        });
    }

    catch (error) {
        console.error("خطا در بازگشت کتاب:", error);
        res.status(500).json({
            message: "خطا در بازگشت کتاب",
            error: error.message
        });
    }
}

// اعمال جریمه دستی
export async function applyFine(req, res) {
    try {
        const fineAmount = Number(req.body.amount);
        if (Number.isNaN(fineAmount)) return res.status(400).json({
            message: "مبلغ جریمه نامعتبر است"
        });

        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: "رکورد امانت پیدا نشد" });

        issue.manualFine = fineAmount;
        if (fineAmount > 0) issue.fineCleared = false;
        await issue.save();

        res.status(200).json({
            success: true,
            message: "جریمه دستی با موفقیت اعمال شد!",
            issue
        });
    }

    catch (error) {
        console.error("خطا در اعمال جریمه دستی:", error);
        res.status(500).json({
            message: "خطا در اعمال جریمه دستی",
            error: error.message
        });
    }
}

// پاک کردن جریمه دستی
export async function clearFine(req, res) {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: "رکورد امانت پیدا نشد" });

        Object.assign(issue, {
            manualFine: 0,
            fineCleared: true,
            clearedFineAmount: calculateFine(issue, issue.fineRate, issue.fineInterval)
        });
        await issue.save();

        res.status(200).json({
            success: true,
            message: "جریمه با موفقیت پاک شد!",
            issue
        });
    }

    catch (error) {
        console.error("خطا در پاک کردن جریمه دستی:", error);
        res.status(500).json({
            message: "خطا در اعمال جریمه دستی",
            error: error.message
        });
    }
}

// دریافت تنظیمات فعال جریمه
export async function getFineSettings(req, res) {
    try {
        const settings = (await FineSetting.findOne({})) ||
            (await FineSetting.create({ amount: 10, interval: "day" }));
        res.status(200).json({ success: true, settings });
    }

    catch (error) {
        console.error("خطا در دریافت تنظیمات جریمه:", error);
        res.status(500).json({
            message: "خطا در دریافت تنظیمات جریمه",
            error: error.message
        });
    }
}

// بروزرسانی تنظیمات جریمه
export async function updateFineSettings(req, res) {
    try {
        const { amount, interval } = req.body;
        let settings = await FineSetting.findOne({});

        if (settings) {
            if (amount !== undefined) settings.amount = Number(amount);
            if (interval !== undefined) settings.interval = interval;
            await settings.save();
        } else {
            settings = await FineSetting.create({
                amount: Number(amount) || 10,
                interval: interval || "day"
            });
        }

        res.status(200).json({
            success: true,
            message: "تنظیمات جریمه با موفقیت بروزرسانی شد!",
            settings
        });

    } catch (error) {
        console.error("خطا در بروزرسانی تنظیمات جریمه:", error);
        res.status(500).json({
            message: "خطا در بروزرسانی تنظیمات جریمه", 
            error: error.message
        });
    }
}