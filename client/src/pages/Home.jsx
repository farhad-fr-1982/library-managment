import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { ArrowLeft, BookMarked, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../shared/AuthContext';
import { homeStyles as s } from "../assets/dummyStyles";

// ============ navItems ============
const navItems = [
    {
        label: "داشبورد دانشجو",
        description: "مشاهده کتاب‌های امانتی، جریمه‌ها و اطلاعات پروفایل",
        href: "/user/dashboard",
        match: "/user",
        icon: "dashboard",
    },
    {
        label: "داشبورد مدیر",
        description: "مدیریت امانت‌ها، بازگشت‌ها و جریمه‌های دانشجویان",
        href: "/admin/dashboard",
        match: "/admin",
        icon: "admin",
    },
];

// ============ features (اضافه شد!) ============
const features = [
    {
        icon: BookMarked,
        title: "امانت دستی کتاب",
        text: "پیگیری امانت‌های دستی، تاریخ سررسید، بازگشت‌ها و محاسبه پویا جریمه در یک گردش کار.",
    },
    {
        icon: Users,
        title: "خودخدمتی دانشجو",
        text: "دانشجویان می‌توانند کتاب‌های امانتی، جریمه‌های معوق، اطلاعات تحصیلی و فعالیت‌های اخیر خود را به سرعت بررسی کنند.",
    },
    {
        icon: ShieldCheck,
        title: "کنترل‌های میز مدیریت",
        text: "کارکنان کتابخانه می‌توانند سوابق دانشجویان، امانت‌های دستی، موارد دیرکرد و تنظیمات جریمه را از پنل مدیریت مدیریت کنند.",
    },
];

// ============ کامپوننت Home ============
const Home = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const footerItems = currentUser
        ? [
            {
                label: "خروج",
                icon: "login",
                kind: "primary",
                action: () => {
                    logout();
                    navigate("/");
                },
            },
        ]
        : [
            { label: "ورود", href: "/login", icon: "login", kind: "primary" },
            {
                label: "ثبت‌نام",
                href: "/signup",
                icon: "signup",
                kind: "secondary",
            },
        ];

    return (
        <div className={s.layoutContainer}>
            <Sidebar
                title="کتاب یار"
                subtitle="پورتال مدیریت کتابخانه"
                badge="قالب زیبا"
                navItems={navItems}
                footerItems={footerItems}
            />

            <main className={s.mainContent}>
                <div className={s.innerContainer}>
                    
                    {/* ============ بخش Hero ============ */}
                    <section className={s.heroSection}>
                        <div className={s.heroGrid}>

                            {/* ستون اول: متن اصلی */}
                            <div className={s.heroLeft}>
                                <span className={s.heroBadge}>
                                    پورتال مدیریت کتابخانه
                                </span>

                                <h1 className={s.heroTitle}>
                                    مدیریت دانشجویان، کتاب‌ها، بازگشت‌ها و جریمه‌ها در یک داشبورد کتابخانه.
                                </h1>

                                <p className={s.heroText}>
                                    این پورتال مدیریت کتابخانه به دانشجویان یک داشبورد متمرکز برای امانت کتاب می‌دهد و به مدیران یک فضای کاری کاربردی برای گردش دستی کتاب، سوابق کاربران و پیگیری دیرکردها ارائه می‌کند.
                                </p>

                                <div className={s.heroButtons}>
                                    {currentUser ? (
                                        <Link
                                            to={currentUser.role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
                                            className={s.heroButtonPrimary}
                                        >
                                            رفتن به داشبورد
                                            <ArrowLeft size={16} />
                                        </Link>
                                    ) : (
                                        <>
                                            <Link to="/signup" className={s.heroButtonPrimary}>
                                                ایجاد حساب کاربری
                                                <ArrowLeft size={16} />
                                            </Link>
                                            <Link to="/login" className={s.heroButtonSecondary}>
                                                ورود به سیستم
                                                <ArrowLeft size={16} />
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* ستون دوم: کارت اطلاعات */}
                            <div className="grid gap-4">
                                <div className={s.infoCard}>
                                    <p className={s.infoCardLabel}>گردش کار کتابخانه</p>

                                    <p className={s.infoCardTitle}>
                                        داشبوردهای جداگانه برای دانشجو و مدیر، طراحی‌شده برای عملیات روزانه کتابخانه.
                                    </p>

                                    {/* ✅ فقط یک بار (تکرار حذف شد) */}
                                    <p className={s.infoCardText}>
                                        فعالیت‌های امانت را پیگیری کنید، سوابق پروفایل را به‌روز نگه دارید و دیرکردها را بدون خروج از سیستم رصد کنید.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ============ بخش ویژگی‌ها ============ */}
                    <section className={s.featuresGrid}>
                        {features.map(({ icon: Icon, title, text }) => (
                            <article key={title} className={s.featureCard}>
                                <span className={s.featureIconWrapper}>
                                    <Icon size={22} />   {/* ✅ روش بهتر از createElement */}
                                </span>
                                <h2 className={s.featureTitle}>{title}</h2>
                                <p className={s.featureText}>{text}</p>
                            </article>
                        ))}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Home;