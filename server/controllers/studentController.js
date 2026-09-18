import User from "../models/User.js";

// جستجوی دانشجو با شماره دانشجویی
export async function searchStudentsByRoll(req, res) {
    try {
        const roll = String(req.query.roll || "").trim();
        
        // اگر شماره دانشجویی خالی بود، آرایه خالی برگردان
        if (!roll) {
            return res.status(200).json({ success: true, students: [] });
        }
        
        const rollRegex = new RegExp(roll, "i");
        const students = await User.find({
            role: "user",
            isProfileComplete: true,
            rollNo: { $regex: rollRegex }
        })
        .select("name email department stream semester year rollNo")
        .limit(12);
        
        // فقط فیلدهای نام، ایمیل، دانشکده، رشته، ترم، سال و شماره دانشجویی را برگردان
        // و حداکثر ۱۲ نتیجه بده

        // تبدیل داده‌ها برای فرانت‌اند (تغییر نام فیلدها)
        const mappedStudents = students.map((student) => ({
            name: student.name,
            email: student.email,
            department: student.department || "",
            stream: student.stream || "",
            academicYear: student.year || "",
            semester: student.semester || "",
            rollNumber: student.rollNo || "",
        }));

        // پاسخ موفق
        res.status(200).json({
            success: true,
            students: mappedStudents
        });
    }

    catch (error) {
        console.error("خطا در جستجوی دانشجویان با شماره دانشجویی:", error);
        res.status(500).json({
            success: false,
            message: "خطا در جستجوی دانشجویان با شماره دانشجویی",
            error: error.message
        });
    }
}