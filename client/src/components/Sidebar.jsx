import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { sidebarStyles as s } from '../assets/dummyStyles' 
import { Bell, BookCopy, ChartNoAxesCombined, ChevronRight, Menu, ShieldCheck, UserRound, X } from "lucide-react";

//* فعلی رو بگیر، یه حالت باز/بسته تعریف کن، و استایل مناسب رو انتخاب کن یه نقشه آیکون بساز URL
const iconMap = {
    dashboard: ChartNoAxesCombined,
    books: BookCopy,
    alerts: Bell,
    admin: ShieldCheck,
    users: UserRound
};

// ✅ کامپوننت Sidebar (همه کد داخل این تابع)
export default function Sidebar({ 
    title, 
    subtitle, 
    badge, 
    navItems = [], 
    accent = "user", 
    logoSrc 
}) {
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const badgeStyles = accent === "admin" ? s.badgeAdmin : s.badgeUser;

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className={s.mobileMenuButton}>
                <Menu size={18} />
            </button>

            <div className={`${s.mobileOverlay} ${open ? s.mobileOverlayOpen : s.mobileOverlayClosed}`} onClick={() => setOpen(false)} />

            {/* یک سربرگ برای نوار کناری بساز که داخلش یک لوگو نمایش داده می‌شود. اگر logoSrc وجود داشته باشد، عکس لوگو نمایش داده می‌شود. وگرنه، آیکون BookCopy */}
            <aside className={`${s.sidebar} ${open ? s.sidebarOpen : s.sidebarClosed}`}>
                <div className={s.sidebarHeader}>
                    <div className={"min-w-0 pr-3"}>
                        <div className={s.logoWrapper}>
                            {logoSrc ? (
                                <img src={logoSrc} alt="logo" className={s.logoImage} />
                            ) : (
                                <BookCopy size={22} />
                            )}
                        </div>
                        <h2 className={s.title}>{title}</h2>
                        <p className={s.subtitle}>{subtitle}</p>
                        {badge && (
                            <span className={`${s.badgeBase} ${badgeStyles}`}>{badge}</span>
                        )}
                    </div>

                    <button onClick={() => setOpen(false)} type="button" className={s.closeButton} >
                        <X size={18} />
                    </button>
                </div>

                {/* یک نوار ناوبری بساز و روی هر آیتم منو بگرد. برای هر آیتم، آیکون مناسبش را پیدا کن و بررسی کن که آیا صفحه فعلی همان آیتم است یا نه */}
                <nav className={s.nav}>
                    {navItems.map((item) => {
                        const Icon = iconMap[item.icon] ?? ChevronRight;
                        const active =
                            location.pathname === item.href ||
                            (item.match ? location.pathname.startsWith(item.match) : false);

                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setOpen(false)}
                                className={`${s.navLink} ${active ? s.navLinkActive : s.navLinkInactive}`} >
                                <span className={`${s.navIconWrapper} ${active ? s.navIconWrapperActive : s.navIconWrapperInactive}`}>
                                    <Icon size={18} />
                                </span>

                                {/* یک محفظه بساز که برچسب label و توضیحات description آیتم منو را نمایش دهد */}
                                <span className="min-w-0 flex-1">
                                    <span className={s.navLabel}>{item.label}</span>
                                    <span className={`${s.navDescription} ${active ? s.navDescriptionActive : s.navDescriptionInactive}`}>
                                        {item.description}
                                    </span>
                                </span>

                                {/* اگر آیتم فعال باشد، کلاس navChevronActive و اگر غیرفعال باشد، کلاس navChevronInactive را اعمال کن */}
                                <ChevronRight size={16} className={active ? s.navChevronActive : s.navChevronInactive}/>
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    )
}