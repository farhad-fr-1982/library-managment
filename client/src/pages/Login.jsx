import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserRound, ShieldCheck, Mail, LockKeyhole, EyeOff, Eye, ArrowRight, ArrowLeft } from "lucide-react";
import { loginStyles as s } from "../assets/dummyStyles";
import { useAuth } from "../shared/AuthContext";

const roleChoices = [
    {value: "user", label: "دانشجو", icon: UserRound},
    {value: "admin", label: "مدیر", icon: ShieldCheck},
]

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({
        email: "",
        password: "",
        role: "user"
    });
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setError("");
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            const result = await login(form);
            if (!result.ok) {
                setLoading(false);
                setError(result.error || "ورود ناموفق بود");
                return;
            }
            setLoading(false);
            navigate(result.user.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
        } catch (err) {
            setLoading(false);
            setError("یک خطای غیرمنتظره در اتصال رخ داد.");
        }
    };

    return (
        <div className={s.pageContainer}>
            <div className={s.mainCard}>

                {/* ============ پنل چپ: اطلاعات ============ */}
                <section className={s.infoPanel}>
                    <span className={s.roleBadge}>ورود با نقش دانشگاهی</span>
                    <h1 className={s.infoTitle}>
                        ابتدا دانشجو یا مدیر را انتخاب کنید، سپس پنل کتابخانه صحیح را باز کنید.
                    </h1>
                    <p className={s.heroText}>
                        این پورتال مدیریت کتابخانه به دانشجویان یک داشبورد متمرکز برای امانت کتاب می‌دهد و به مدیران یک فضای کاری کاربردی برای گردش دستی کتاب، سوابق کاربران و پیگیری دیرکردها ارائه می‌کند.
                    </p>

                    <div className={s.infoBoxesContainer}>
                        <div className={s.infoBox}>
                            <p className={s.infoBoxTitle}>
                                <UserRound size={16} />
                                ورود دانشجو
                            </p>
                            <p className={s.infoBoxText}>
                                یک حساب دانشجویی جدید با لینک «ایجاد حساب» بسازید تا عملکرد دانشجو را با داده‌های واقعی آزمایش کنید.
                            </p>
                        </div>

                        <div className={s.infoBox}>
                            <p className={s.infoBoxTitle}>
                                <ShieldCheck size={16} />
                                دسترسی مدیر
                            </p>
                            <p className={s.infoBoxText}>
                                با حساب مدیر ثبت‌شده خود وارد شوید تا به داشبورد مدیریت و امکانات فهرست کتابخانه دسترسی داشته باشید.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ============ پنل راست: فرم ورود ============ */}
                <section className={s.formPanel}>
                    <div className={s.formInner}>

                        <Link to="/" className={s.backLink}>
                            بازگشت به صفحه اصلی
                        </Link>

                        <h2 className={s.formTitle}>ورود به حساب کاربری</h2>
                        <p className={s.formSubtitle}>
                            نقش خود را انتخاب کنید و از اطلاعات حساب کتابخانه دانشگاه خود استفاده کنید.
                        </p>

                        <form className={s.form} onSubmit={handleSubmit}>

                            {/* انتخاب نقش */}
                            <div className={s.roleContainer}>
                                <p className={s.roleLabel}>نقش ورود را انتخاب کنید</p>
                                <div className={s.roleGrid}>
                                    {roleChoices.map((choice) => {
                                        const Icon = choice.icon;
                                        return (
                                            <label
                                                key={choice.value}
                                                className={`${s.roleOption} ${
                                                    form.role === choice.value
                                                        ? s.roleOptionSelected
                                                        : s.roleOptionUnselected
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="role"
                                                    value={choice.value}
                                                    checked={form.role === choice.value}
                                                    onChange={handleChange}
                                                    className={s.roleRadio}
                                                />
                                                <span className={s.roleIconLabel}>
                                                    <Icon size={16} />
                                                    {choice.label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* فیلد ایمیل */}
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

                            {/* فیلد رمز عبور */}
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
                                        placeholder="رمز عبور خود را وارد کنید"
                                        className={s.passwordInput}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((current) => !current)}
                                        className={s.togglePasswordButton}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </label>

                            {/* نمایش خطا */}
                            {error && <p className={s.errorMessage}>{error}</p>}

                            {/* فوتر فرم (متن شرطی + لینک ثبت‌نام) */}
                            <div className={s.footerFlex}>
                                <span className={s.footerText}>
                                    {form.role === "admin"
                                        ? "حساب‌های مدیر از اطلاعات ورود موجود استفاده می‌کنند"
                                        : "ثبت‌نام دانشجو در زیر موجود است"}
                                </span>
                                {form.role === "user" && (
                                    <Link to="/signup" className={s.signupLink}>
                                        ایجاد حساب کاربری
                                    </Link>
                                )}
                            </div>

                            {/* دکمه ورود */}
                            <button type="submit" className={s.submitButton} disabled={loading}>
                                {loading ? "در حال ورود..." : (
                                    <>
                                        ورود به سیستم
                                        <ArrowLeft size={16} />
                                    </>
                                )}
                            </button>
                        </form>

                    </div>
                </section>

            </div>
        </div>
    );
};

export default Login;