import React from 'react'
import { userLayoutStyles as s } from '../assets/dummyStyles';
import logoSrc from '../assets/library-mark.svg';
import Sidebar from '../components/Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from "../shared/AuthContext";

const navItems = [
    {
        label: "داشبورد دانشجو",
        description: "نمای کلی کتابخانه دانشگاه شما",
        href: "/user/dashboard",
        match: "/user/dashboard",
        icon: "dashboard",
    },
    {
        label: "صفحه کتاب‌ها",
        description: "کتاب‌های امانتی، جریمه‌ها و تاریخ‌های سررسید",
        href: "/user/books",
        match: "/user/books",
        icon: "books",
    },
    {
        label: "ویرایش پروفایل",
        description: "به‌روزرسانی اطلاعات دانشجویی",
        href: "/user/profile",
        match: "/user/profile",
        icon: "users",
    },
];

const UserLayout = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate()

    const footerItems = currentUser
        ? [
            {
                label: "خروج",
                icon: "login",
                kind: "primary",
                action: () => {
                    logout();
                    navigate("/login");
                },
            },
        ]
        : [];

    return (
        <div className={s.layoutContainer}>
            <Sidebar title="Student Desk" subtitle="College library access"
                badge="Student section" navItems={navItems} footerItems={footerItems} logoSrc={logoSrc} />

            <main className={s.mainContent}>
                <div className={s.innerContainer}>
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default UserLayout