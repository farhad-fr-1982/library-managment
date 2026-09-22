import React from 'react'
import { userBookCardStyles as s } from '../assets/dummyStyles';

const statusStyles = {
    Borrowed: "bg-amber-100 text-amber-900",
    Overdue: "bg-rose-100 text-rose-900",
    Returned: "bg-slate-200 text-slate-800",
};

const statusLabels = {
    Borrowed: "امانت‌گرفته‌شده",
    Overdue: "معوق",
    Returned: "بازگردانده‌شده",
};

const UserBookCard = ({ record, borrowerName }) => {
    return (
        <article className={s.card}>
            <div className={s.header}>
                <div className="min-w-0">
                    <p className={s.title}>{record.title}</p>
                </div>

                <span className={`${s.statusBadge} ${statusStyles[record.liveStatus]}`}>
                    {statusLabels[record.liveStatus] || record.liveStatus}
                </span>
            </div>

            <div className={s.detailsGrid}>
                <div className={s.detailBlock}>
                    <p className={s.detailLabel}>کد کتاب</p>
                    <p className={s.detailValue}>{record.bookCode}</p>
                </div>

                <div className={s.detailBlock}>
                    <p className={s.detailLabel}>نام امانت‌گیرنده</p>
                    <p className={s.detailValue}>{borrowerName}</p>
                </div>

                <div className={s.detailBlock}>
                    <p className={s.detailLabel}>تاریخ امانت</p>
                    <p className={s.numericValue}>{record.issueLabel}</p>
                </div>

                <div className={s.detailBlock}>
                    <p className={s.detailLabel}>تاریخ سررسید</p>
                    <p className={s.numericValue}>{record.dueLabel}</p>
                </div>

                <div className={s.detailBlock}>
                    <p className={s.detailLabel}>جریمه</p>
                    <p className={s.numericValue}>
                        {record.liveFine > 0 
                            ? `${record.liveFine.toLocaleString('fa-IR')} تومان` 
                            : "ندارد"}
                    </p>
                </div>

                <div className={s.detailBlock}>
                    <p className={s.detailLabel}>وضعیت بازگشت</p>
                    <p className={s.detailValue}>
                        {record.returnedOn
                            ? "توسط مدیر بازگردانده شد"
                            : "در انتظار بازگشت توسط مدیر"}
                    </p>
                </div>
            </div>
        </article>
    );
};

export default UserBookCard