import React from 'react'
import Sidebar from '../components/Sidebar'
import { BookMarked, ShieldCheck, Users } from 'lucide-react';

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

const Home = () => {
    const footerItems = currentUser
        ? [
            {
                label: "Logout",
                icon: "login",
                kind: "primary",
                action: () => {
                    logout();
                    navigate("/");
                },
            },
        ]
        : [
            { label: "Login", href: "/login", icon: "login", kind: "primary" },
            {
                label: "Sign Up",
                href: "/signup",
                icon: "signup",
                kind: "secondary",
            },
        ];

    return (
        <div>
            <div>
                <Sidebar title="شلف‌وایز" subtitle="پورتال مدیریت کتابخانه" badge="قالب زیبا" navItems={navItems} footerItems={footerItems} />
            </div>
        </div>
    )
}

export default Home
