import React, { useEffect, useState } from 'react'
import { useAuth } from '../shared/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, UserRound, Mail, Phone, LockKeyhole, Eye, EyeOff } from 'lucide-react';
import { signupStyles as s } from "../assets/dummyStyles";

const stepList = [
    { id: 1, title: "حساب کاربری" },
    { id: 2, title: "کد تایید" },
    { id: 3, title: "پروفایل" },
];

const signupHighlights = [
    "مرحله ۱ اطلاعات حساب دانشجو را جمع‌آوری می‌کند و فوراً بررسی می‌کند که آیا ایمیل از قبل وجود دارد یا نه.",
    "مرحله ۲ قبل از ادامه، کد تایید را بررسی می‌کند.",
    "مرحله ۳ دانشکده، رشته، ترم، سال و شماره دانشجویی را ذخیره می‌کند.",
];

const demoOtp = "2468";

const Signup = () => {
    const { registerStudent, verifyOtpCode, completeProfileData, logout } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        otp: "",
        role: "user",
        department: "",
        stream: "",
        semester: "Semester 1",
        academicYear: "1st Year",
        rollNumber: "",
    });

    useEffect(() => {
        if (!toast) return undefined;
        const timer = setTimeout(() => setToast(null), 2600);
        return () => clearTimeout(timer);
    }, [toast]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setError("");
        if (name === "phone") {
            const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
            setForm((current) => ({ ...current, [name]: digitsOnly }));
        } else
            setForm((current) => ({
                ...current, [name]: value
            }))
    };

    const validateStepOne = () => {
        if (
            !form.name.trim() ||
            !form.email.trim() ||
            !form.phone.trim() ||
            !form.password.trim()
        ) {
            setError("Please fill name, email, mobile number, and password first.");
            return false;
        }
        if (form.phone.trim().replace(/\D/g, "").length !== 10) {
            setError("Mobile number must be exactly 10 digits.");
            return false;
        }
        return true;
    };

    const validateStepThree = () => {
        if (
            !form.department.trim() ||
            !form.stream.trim() ||
            !form.semester.trim() ||
            !form.academicYear.trim() ||
            !form.rollNumber.trim()
        ) {
            setError(
                "Please complete department, stream, semester, year, and roll number."
            );
            return false;
        }
        return true;
    };

    const showToast = (message, tone = "success") => {
        setToast({ message, tone });
    };

    const goNext = async () => {
        setError("");

        if (step === 1) {
            if (!validateStepOne()) return;
            setLoading(true);
            const res = await registerStudent({
                name: form.name,
                email: form.email,
                phone: form.phone,
                password: form.password,
            });
            setLoading(false);
            if (!res.ok) {
                showToast(res.error, "error");
                setError(res.error);
                return;
            }
            showToast("OTP sent to your email successfully!");
        }

        if (step === 2) {
            if (!form.otp.trim()) {
                setError("Please enter the 6-digit OTP code sent to your email.");
                return;
            }
            setLoading(true);
            const res = await verifyOtpCode({
                email: form.email,
                otp: form.otp,
            });
            setLoading(false);
            if (!res.ok) {
                showToast(res.error, "error");
                setError(res.error);
                return;
            }
            showToast("OTP verified successfully!");
        }

        setStep((current) => Math.min(3, current + 1));
    };

    const goBack = () => {
        setError("");
        setStep((current) => Math.max(1, current - 1));
    };

    // ارسال داده و ثبت‌نام کاربر در سرور
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        if (!validateStepOne() || !form.otp.trim() || !validateStepThree()) {
            setError("لطفاً ابتدا تمام مراحل را تکمیل کنید");
            return;
        }

        setLoading(true);
        const result = await completeProfileData({
            email: form.email,
            department: form.department,
            stream: form.stream,
            semester: form.semester,
            academicYear: form.academicYear,
            rollNumber: form.rollNumber
        });

        setLoading(false);
        if (!result.ok) {
            showToast(result.error, "error");
            setError(result.error);
            return;
        }

        showToast("پروفایل دانشجو تکمیل شد. در حال انتقال به صفحه ورود...");
        setTimeout(() => {
            logout();
            navigate("/login", {
                replace: true,
                state: {
                    signupEmail: form.email,
                    signupPassword: form.password,
                },
            });
        }, 1000);
    };

    return (
        <div className={s.pageContainer}>
            {toast && (
                <div
                    className={`${s.toastBase} ${toast.tone === "error" ? s.toastError : s.toastSuccess
                        }`}
                >
                    <div className={s.toastContent}>
                        <CheckCircle2 size={18} />
                        {toast.message}
                    </div>
                </div>
            )}

            <div className={s.mainCard}>
                <section className={s.formPanel}>
                    <div className={s.formInner}>
                        <Link to="/" className={s.backLink}>
                            بازگشت به صفحه اصلی
                        </Link>

                        <h1 className={s.panelTitle}>
                            ایجاد حساب کاربری دانشجو
                        </h1>
                        <p className={s.panelSubtitle}>
                            مراحل ثبت‌نام دانشجو را کامل کنید: حساب کاربری، کد تایید و پروفایل.
                        </p>

                        {/* نوار پیشرفت */}
                        <div className={s.stepGrid}>
                            {stepList.map((item) => (
                                <div
                                    key={item.id}
                                    className={`${s.stepCard} ${step >= item.id ? s.stepCardCompleted : s.stepCardPending
                                        }`}>
                                    <p className={s.stepLabel}>مرحله {item.id}</p>
                                    <p className={s.stepTitle}>{item.title}</p>
                                </div>
                            ))}
                        </div>

                        {/* ============ فرم ============ */}
                        <form className={s.form} onSubmit={handleSubmit}>

                            {/* ============ مرحله ۱: حساب کاربری ============ */}
                            {step === 1 && (
                                <>
                                    {/* نام کامل */}
                                    <label className="block">
                                        <span className={s.fieldLabel}>
                                            <UserRound size={15} />
                                            نام و نام خانوادگی
                                        </span>
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="نام کامل خود را وارد کنید"
                                            className={s.input}
                                        />
                                    </label>

                                    {/* ایمیل */}
                                    <label className="block">
                                        <span className={s.fieldLabel}>
                                            <Mail size={15} />
                                            آدرس ایمیل
                                        </span>
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="student@campus.edu"
                                            className={s.input}
                                        />
                                    </label>

                                    {/* شماره موبایل */}
                                    <label className="block">
                                        <span className={s.fieldLabel}>
                                            <Phone size={15} />
                                            شماره موبایل
                                        </span>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="+91 1234567890"
                                            className={s.input}
                                        />
                                    </label>

                                    {/* رمز عبور */}
                                    <label className="block">
                                        <span className={s.fieldLabel}>
                                            <LockKeyhole size={15} />
                                            رمز عبور
                                        </span>
                                        <div className={s.passwordWrapper}>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={form.password}
                                                onChange={handleChange}
                                                placeholder="رمز عبور خود را بسازید"
                                                className={s.passwordInput}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((current) => !current)}
                                                className={s.toggleButton}
                                            >
                                                {showPassword ? (
                                                    <EyeOff size={17} />
                                                ) : (
                                                    <Eye size={17} />
                                                )}
                                            </button>
                                        </div>
                                    </label>
                                </>
                            )}

                            {/* ============ مرحله ۲: کد تایید ============ */}
                            {step === 2 && (
                                <label className="block">
                                    <span className={s.fieldLabel}>
                                        کد تایید
                                    </span>
                                    <input
                                        type="text"
                                        name="otp"
                                        value={form.otp}
                                        onChange={handleChange}
                                        placeholder="کد ۶ رقمی ارسال شده به ایمیل"
                                        className={s.input}
                                        maxLength={6}
                                    />
                                </label>
                            )}

                            {/* ============ مرحله ۳: پروفایل ============ */}
                            {step === 3 && (
                                <>
                                    <label className="block">
                                        <span className={s.fieldLabel}>دانشکده</span>
                                        <input
                                            type="text"
                                            name="department"
                                            value={form.department}
                                            onChange={handleChange}
                                            placeholder="مثلاً مهندسی کامپیوتر"
                                            className={s.input}
                                        />
                                    </label>

                                    <label className="block">
                                        <span className={s.fieldLabel}>رشته</span>
                                        <input
                                            type="text"
                                            name="stream"
                                            value={form.stream}
                                            onChange={handleChange}
                                            placeholder="مثلاً نرم‌افزار"
                                            className={s.input}
                                        />
                                    </label>

                                    <label className="block">
                                        <span className={s.fieldLabel}>ترم</span>
                                        <input
                                            type="text"
                                            name="semester"
                                            value={form.semester}
                                            onChange={handleChange}
                                            className={s.input}
                                        />
                                    </label>

                                    <label className="block">
                                        <span className={s.fieldLabel}>سال تحصیلی</span>
                                        <input
                                            type="text"
                                            name="academicYear"
                                            value={form.academicYear}
                                            onChange={handleChange}
                                            className={s.input}
                                        />
                                    </label>

                                    <label className="block">
                                        <span className={s.fieldLabel}>شماره دانشجویی</span>
                                        <input
                                            type="text"
                                            name="rollNumber"
                                            value={form.rollNumber}
                                            onChange={handleChange}
                                            placeholder="مثلاً CS-20261"
                                            className={s.input}
                                        />
                                    </label>
                                </>
                            )}

                            {/* نمایش خطا */}
                            {error && <p className={s.errorMessage}>{error}</p>}

                            {/* دکمه‌ها */}
                            <div className={s.buttonGroup}>
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={goBack}
                                        className={s.backButton}
                                        disabled={loading}
                                    >
                                        قبلی
                                    </button>
                                )}

                                {step < 3 ? (
                                    <button
                                        type="button"
                                        onClick={goNext}
                                        className={s.nextButton}
                                        disabled={loading}
                                    >
                                        {loading ? "در حال بررسی..." : "بعدی"}
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className={s.submitButton}
                                        disabled={loading}
                                    >
                                        {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </section>

                {/* پنل راست: اطلاعات */}
                <section className={s.infoPanel}>
                    <span className={s.infoBadge}>راهنمای ثبت‌نام</span>
                    <h1 className={s.infoTitle}>در سه مرحله ثبت‌نام کنید</h1>

                    <ul className={s.infoList}>
                        {signupHighlights.map((highlight, index) => (
                            <li key={index} className={s.infoListItem}>
                                {highlight}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    )
}

export default Signup