import React from 'react'
import { protectedRouteStyles as s } from '../assets/dummyStyles';
import { useAuth } from './AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ allowedRole }) => {
    const { currentUser, ready } = useAuth();
    const location = useLocation();

    // ⏳ اگر Auth آماده نیست
    if (!ready) {
        console.log("مسیر محافظت‌شده: احراز هویت هنوز آماده نیست");
        return (
            <div className={s.loadingContainer}>
                <div className={s.loadingCard}>
                    در حال بارگذاری فضای کاری کتابخانه شما
                </div>
            </div>
        );
    }

    // ❌ اگر کاربر لاگین نکرده
    if (!currentUser) {
        const hasToken = localStorage.getItem("library-auth-token");
        console.log(
            "مسیر محافظت‌شده: کاربری وجود ندارد. آیا توکن دارد؟",
            !!hasToken,
            "نقش مجاز:",
            allowedRole,
        );

        // ⏳ اگر توکن هست، لودینگ نمایش بده
        if (hasToken) {
            return (
                <div className={s.loadingContainer}>
                    <div className={s.loadingCard}>
                        در حال همگام‌سازی فضای کاری شما...
                    </div>
                </div>
            );
        }

        // ❌ اگر توکن نیست، هدایت به /login
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    // ✅ چاپ اطلاعات برای دیباگ
    console.log(
        "مسیر محافظت‌شده: کاربر فعلی:",
        currentUser.role,
        "نقش مجاز:",
        allowedRole,
    );

    // ❌ اگر نقش کاربر مجاز نیست
    if (allowedRole && currentUser.role !== allowedRole) {
        console.warn("مسیر محافظت‌شده: عدم تطابق نقش! هدایت به صفحه ورود");
        return <Navigate to="/login" replace state={{
            from: location.pathname
        }} />;
    }

    // ✅ همه چیز درست است → نمایش فرزندان
    return <Outlet />;
}

export default ProtectedRoute;