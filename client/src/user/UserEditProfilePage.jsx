import React, { useEffect, useState } from 'react'
import { userEditProfilePageStyles as s } from '../assets/dummyStyles';
import { studentSemesters, studentYears } from '../data/libraryData';
import { useAuth } from '../shared/AuthContext';
import { Pencil, CheckCircle2 } from 'lucide-react';

const UserEditProfilePage = () => {
    const { currentUser, updateProfile } = useAuth();

    // ✅ تابع کمکی برای ساخت فرم از روی currentUser
    const buildFormFromUser = (user) => ({
        name: user?.name ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
        department: user?.department ?? "",
        stream: user?.stream ?? "",
        semester: user?.semester ?? "",
        academicYear: user?.academicYear ?? "",
        rollNumber: user?.rollNumber ?? "",
    });

    const [form, setForm] = useState(buildFormFromUser(currentUser));
    const [toast, setToast] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // ✅ همگام‌سازی فرم با currentUser هنگام تغییر (بعد از ذخیره یا لود)
    useEffect(() => {
        if (currentUser) {
            setForm(buildFormFromUser(currentUser));
        }
    }, [currentUser]);

    // ✅ پاک کردن خودکار Toast بعد از ۲.۴ ثانیه
    useEffect(() => {
        if (!toast) return undefined;
        const timer = setTimeout(() => setToast(""), 2400);
        return () => clearTimeout(timer);
    }, [toast]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setError("");
        if (name === "phone") {
            const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
            setForm((current) => ({ ...current, [name]: digitsOnly }));
        } else {
            setForm((current) => ({ ...current, [name]: value }));
        }
    };

    // ✅ ارسال فرم و ذخیره پروفایل
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (form.phone.trim().replace(/\D/g, "").length !== 10) {
            setError("شماره موبایل باید دقیقاً ۱۰ رقم باشد.");
            return;
        }

        setLoading(true);

        try {
            const result = await updateProfile(form);
            setLoading(false);

            if (result.ok) {
                // اگر user به‌روزرسانی‌شده برگشت، فرم را با آن پر کن
                if (result.user) {
                    setForm(buildFormFromUser(result.user));
                }
                // نمایش پیام موفقیت
                setToast(result.message || "پروفایل با موفقیت به‌روزرسانی شد.");
                // بستن حالت ویرایش
                setIsEditing(false);
            } else {
                setError(result.error || "به‌روزرسانی پروفایل ناموفق بود. لطفاً دوباره تلاش کنید.");
            }
        } catch (err) {
            setLoading(false);
            setError("یک خطای غیرمنتظره در ارتباط رخ داد.");
        }
    };

    // ✅ دکمه انصراف: بازگشت به مقادیر قبلی
    const handleCancel = () => {
        setError("");
        setIsEditing(false);
        setForm(buildFormFromUser(currentUser));
    };

    return (
        <div className={s.pageContainer}>
            {toast && (
                <div className={s.toastWrapper}>
                    <div className={s.toastContent}>
                        <CheckCircle2 size={18} />
                        <span>{toast}</span>
                    </div>
                </div>
            )}

            <section className={s.mainSection}>
                <div className={s.headerFlex}>
                    <div>
                        <h1 className={s.title}>ویرایش پروفایل</h1>
                        <p className={s.subtitle}>
                            اطلاعات دانشجویی خود را به‌روزرسانی کنید و آخرین اطلاعات پروفایل را ذخیره کنید.
                        </p>
                    </div>

                    {!isEditing && (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className={s.editButton}
                        >
                            <Pencil size={18} />
                        </button>
                    )}
                </div>

                <form className={s.formContainer} onSubmit={handleSubmit}>
                    <label className={s.label}>
                        <span className={s.labelSpan}>نام</span>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={s.input}
                        />
                    </label>

                    <label className={s.label}>
                        <span className={s.labelSpan}>ایمیل</span>
                        <input
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            disabled={true}
                            className={s.inputDisabled}
                        />
                        <span className={s.helperText}>
                            آدرس ایمیل قابل تغییر نیست.
                        </span>
                    </label>

                    <label className={s.label}>
                        <span className={s.labelSpan}>شماره موبایل</span>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={s.input}
                        />
                    </label>

                    <label className={s.label}>
                        <span className={s.labelSpan}>دپارتمان</span>
                        <input
                            name="department"
                            value={form.department}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={s.input}
                        />
                    </label>

                    <label className={s.label}>
                        <span className={s.labelSpan}>رشته</span>
                        <input
                            name="stream"
                            value={form.stream}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={s.input}
                        />
                    </label>

                    <label className={s.label}>
                        <span className={s.labelSpan}>ترم</span>
                        <select
                            name="semester"
                            value={form.semester}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={s.select}
                            dir="rtl"
                        >
                            {studentSemesters.map((semester) => (
                                <option key={semester} value={semester}>
                                    {semester}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className={s.label}>
                        <span className={s.labelSpan}>سال</span>
                        <select
                            name="academicYear"
                            value={form.academicYear}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={s.select}
                            dir="rtl"
                        >
                            {studentYears.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className={s.label}>
                        <span className={s.labelSpan}>شماره دانشجویی</span>
                        <input
                            name="rollNumber"
                            value={form.rollNumber}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={s.input}
                        />
                    </label>

                    {error && <div className={s.errorMessage}>{error}</div>}

                    {isEditing && (
                        <div className={s.buttonGroup}>
                            <button
                                type="submit"
                                disabled={loading}
                                className={s.saveButton}
                            >
                                {loading ? "در حال ذخیره..." : "ذخیره پروفایل"}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={loading}
                                className={s.cancelButton}
                            >
                                انصراف
                            </button>
                        </div>
                    )}
                </form>
            </section>
        </div>
    )
}

export default UserEditProfilePage