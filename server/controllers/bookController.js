import User from "../models/User.js";
import FineSetting from "../models/FineSetting.js";
import jalaali from "jalaali-js";

// ✅ تابع کمکی برای دو رقمی کردن اعداد
const pad = (n) => String(n).padStart(2, "0");

// ✅ تبدیل تاریخ به شمسی (فرمت: YYYY-MM-DD)
const getLocalIsoDate = (value = new Date()) => {
    const d = new Date(value);
    const gy = d.getFullYear();
    const gm = d.getMonth() + 1;
    const gd = d.getDate();

    // تبدیل میلادی به شمسی
    const { jy, jm, jd } = jalaali.toJalaali(gy, gm, gd);

    return `${jy}-${pad(jm)}-${pad(jd)}`;
};

//  شروع روز (نیمه‌شب)
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

//  امانت دستی کتاب‌ها به دانشجو
export async function issueManualBooks(req, res) {
    try {
        const { studentDetails, books } = req.body;
        if (!Array.isArray(books) || books.length === 0) {
            return res.status(400).json({ message: "هیچ کتابی وارد نشده است" })
        }

        const student = await User.findOne({ rollNumber: studentDetails.rollNumber });
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

        //*برای هر کتاب، یه رکورد امانت تو دیتابیس می‌سازه — همه رو با هم، نه یکی یکی
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
            department: studentDetails.department?.trim() || student.department || "General",
            stream: studentDetails.stream?.trim() || student.stream || "General",
            year: studentDetails.academicYear?.trim() || student.year || "1st Year",
            semester: studentDetails.semester?.trim() || student.semester || "Semester 1",
            rollNumber: studentDetails.rollNumber?.trim() || student.rollNo || "Not assigned",
            studentId: student.rollNo || `ST-${student._id.toString().slice(-4)}`
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