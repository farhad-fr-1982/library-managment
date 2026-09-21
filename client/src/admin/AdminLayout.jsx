import React from "react";
import { adminLayoutStyles as s } from "../assets/dummyStyles";
import logoSrc from "../assets/library-mark.svg";
import Sidebar from "../components/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../shared/AuthContext";  

const navItems = [
    {
        label: "داشبورد مدیر",
        description: "تحلیل‌های دفتر کتابخانه",
        href: "/admin/dashboard",
        match: "/admin/dashboard",
        icon: "dashboard",
    },
    {
        label: "صفحه کتاب‌ها",
        description: "موجودی، جریمه‌ها و بازگشت‌ها",
        href: "/admin/books",
        match: "/admin/books",
        icon: "books",
    },
    {
        label: "صفحه کاربران",
        description: "تاریخچه امانت هر دانشجو",
        href: "/admin/users",
        match: "/admin/users",
        icon: "users",
    },
    {
        label: "صفحه جریمه‌ها",
        description: "قوانین و تنظیمات جریمه دیرکرد",
        href: "/admin/fines",
        match: "/admin/fines",
        icon: "alerts",
    },
];

const AdminLayout = () => {
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
                    navigate("/login");
                },
            },
        ]
        : [];

    return (
        <div className={s.layoutContainer}>
            <Sidebar
                title="دفتر کتابخانه"
                subtitle="کنترل‌های مدیریت دانشگاه"
                badge="بخش مدیر"
                navItems={navItems}
                footerItems={footerItems}
                accent="admin"
                logoSrc={logoSrc}
            />

            <main className={s.mainContent}>
                <div className={s.innerContainer}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;