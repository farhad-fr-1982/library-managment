import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import { Eye, Download, Search, CheckCircle2, UsersRound, ShieldCheck, UserRoundCog } from 'lucide-react';
import { adminUsersPageStyles as s } from '../assets/dummyStyles'
import { useLibrary } from '../shared/LibraryContext';
import { createElement } from 'react';

const roleStyles = {
  user: "bg-emerald-100 text-emerald-900",
  admin: "bg-amber-100 text-amber-900",
};

const roleLabels = {
  user: "دانشجو",
  admin: "مدیر",
};

const statusStyles = {
  Clear: "bg-emerald-100 text-emerald-900",
  Overdue: "bg-rose-100 text-rose-900",
  Borrowing: "bg-amber-100 text-amber-900",
};

const recordStatusStyles = {
  Borrowed: "bg-amber-100 text-amber-900",
  Overdue: "bg-rose-100 text-rose-900",
  Returned: "bg-slate-200 text-slate-800",
};

const studentFilterOptions = [
  { value: "All", label: "همه دانشجویان" },
  { value: "Overdue", label: "دانشجویان دیرکرد" },
  { value: "Borrowing", label: "دانشجویان امانت‌گیرنده" },
  { value: "Clear", label: "دانشجویان پاک" },
];

const overdueSortOptions = [
  { value: "high-to-low", label: "جریمه از زیاد به کم" },
  { value: "low-to-high", label: "جریمه از کم به زیاد" },
];

const AdminUsersPage = () => {

  const [searchParams, setSearchParams] = useSearchParams();
  const { studentSummaries, clearFineForRecord, returnIssuedRecord } =
    useLibrary();
  const [expandedStudent, setExpandedStudent] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(() => {
    const initialFilter = searchParams.get("status");
    return studentFilterOptions.some((option) => option.value === initialFilter)
      ? initialFilter
      : "All";
  });
  const [overdueSortOrder, setOverdueSortOrder] = useState(() => {
    const initialSort = searchParams.get("sort");
    return overdueSortOptions.some((option) => option.value === initialSort)
      ? initialSort
      : "high-to-low";
  });
  const [confirmAction, setConfirmAction] = useState(null);
  const [toast, setToast] = useState(null);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    const visibleStudents = studentSummaries.filter((member) => {
      const matchesSearch =
        !term ||
        member.name.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term) ||
        (member.rollNumber ?? "").toLowerCase().includes(term) ||
        member.history.some(
          (record) =>
            record.title.toLowerCase().includes(term) ||
            record.bookCode.toLowerCase().includes(term),
        );

      const matchesFilter =
        statusFilter === "All" ||
        (statusFilter === "Borrowing" &&
          member.activeBooks.some(
            (record) => record.liveStatus === "Borrowed",
          )) ||
        (statusFilter === "Overdue" && member.status === "Overdue") ||
        (statusFilter === "Clear" && member.status === "Clear");

      return matchesSearch && matchesFilter;
    });

    // مرتب‌سازی بر اساس تاریخ ایجاد (جدیدترین اول) به صورت پیش‌فرض
    const sorted = [...visibleStudents].sort((first, second) => {
      const firstCreated = new Date(first.createdAt ?? 0).getTime();
      const secondCreated = new Date(second.createdAt ?? 0).getTime();
      return secondCreated - firstCreated;
    });

    // مرتب‌سازی اضافی برای فیلتر دیرکرد
    if (statusFilter === "Overdue") {
      return sorted.sort((first, second) => {
        if (overdueSortOrder === "low-to-high") {
          return first.totalFine - second.totalFine;
        }
        return second.totalFine - first.totalFine;
      });
    }

    return sorted;
  }, [overdueSortOrder, search, statusFilter, studentSummaries]);

  useEffect(() => {
    const nextParams = {};
    if (statusFilter !== "All") {
      nextParams.status = statusFilter;
    }
    if (statusFilter === "Overdue") {
      nextParams.sort = overdueSortOrder;
    }
    setSearchParams(nextParams, { replace: true });
  }, [overdueSortOrder, setSearchParams, statusFilter]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const triggerToast = (message, tone = "success") => {
    setToast({ message, tone });
  };

  const buildCsv = () => {
    const rows = [
      [
        "شماره",
        "نام دانشجو",
        "ایمیل",
        "شناسه دانشجو",
        "دانشکده",
        "رشته",
        "سال",
        "ترم",
        "شماره دانشجویی",
        "وضعیت دانشجو",
        "مجموع جریمه",
        "عنوان کتاب",
        "کد کتاب",
        "نوع ثبت",
        "تاریخ امانت",
        "تاریخ سررسید",
        "جریمه پرداخت‌شده",
        "وضعیت بازگشت",
        "تاریخ بازگشت",
      ],
    ];

    let serial = 1;

    filteredStudents.forEach((member) => {
      if (!member.history.length) {
        rows.push([
          String(serial++),
          member.name,
          member.email,
          member.studentId ?? "",
          member.department ?? "",
          member.stream ?? "",
          member.academicYear ?? "",
          member.semester ?? "",
          member.rollNumber ?? "",
          member.status,
          String(member.totalFine),
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ]);
        return;
      }

      member.history.forEach((record) => {
        rows.push([
          String(serial++),
          member.name,
          member.email,
          member.studentId ?? "",
          member.department ?? "",
          member.stream ?? "",
          member.academicYear ?? "",
          member.semester ?? "",
          member.rollNumber ?? "",
          member.status,
          String(member.totalFine),
          record.title,
          record.bookCode,
          record.recordType,
          record.issueLabel,
          record.dueLabel,
          record.fineCleared ? "بله" : "خیر",
          record.returnedOn ? "بازگردانده‌شده" : "در انتظار",
          record.returnedOnLabel ?? "",
        ]);
      });
    });

    // ✅ اضافه کردن BOM برای پشتیبانی Excel از فارسی
    return (
      "\uFEFF" +
      rows
        .map((row) =>
          row
            .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
            .join(","),
        )
        .join("\n")
    );
  };

  // برای خروجی گرفتن فایل CSV
  const exportCsv = () => {
    const csvContent = buildCsv();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `student-${statusFilter.toLowerCase()}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // برای تایید و پاک کردن جریمه و همچنین بازگشت کتاب
  const handleConfirm = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === "clear-fine") {
      const result = await clearFineForRecord(confirmAction.payload);
      if (result?.ok) {
        triggerToast("جریمه با موفقیت پاک شد!");
      } else {
        triggerToast("پاک کردن جریمه ناموفق بود. لطفاً دوباره تلاش کنید.", "error");
      }
    }

    if (confirmAction.type === "return-book") {
      const result = await returnIssuedRecord(confirmAction.payload);
      if (result?.ok) {
        triggerToast("کتاب با موفقیت بازگردانده شد!");
      } else {
        triggerToast("بازگشت کتاب ناموفق بود. لطفاً دوباره تلاش کنید.", "error");
      }
    }

    setConfirmAction(null);
  };

  return (
    <div className={s.pageContainer}>

      {/* ============ مودال تایید ============ */}
      {confirmAction && (
        <div className={s.fixedModal}>
          <p className={s.modalTitle}>{confirmAction.title}</p>
          <p className={s.modalMessage}>{confirmAction.message}</p>
          <div className={s.modalButtons}>
            <button
              type="button"
              onClick={() => setConfirmAction(null)}
              className={s.modalCancelButton}
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={s.modalConfirmButton}
            >
              تایید
            </button>
          </div>
        </div>
      )}

      {/* ============ Toast ============ */}
      {toast && (
        <div
          className={`${s.toastBase} ${
            toast.tone === "error" ? s.toastError : s.toastSuccess
          }`}
        >
          <div className={s.toastContent}>
            <CheckCircle2 size={18} />
            {toast.message}
          </div>
        </div>
      )}

      {/* ============ بخش آمار ============ */}
      <section className={s.statsSection}>
        <div className={s.statsGrid}>
          {[
            {
              label: "دانشجویان",
              value: `${studentSummaries.length}`,
              icon: UsersRound,
            },
            {
              label: "حساب‌های دیرکرد",
              value: `${studentSummaries.filter((student) => student.status === "Overdue").length}`,
              icon: ShieldCheck,
            },
            {
              label: "امانت‌گیرندگان فعال",
              value: `${
                studentSummaries.filter((student) =>
                  student.activeBooks.some(
                    (record) => record.liveStatus === "Borrowed",
                  ),
                ).length
              }`,
              icon: UserRoundCog,
            },
            {
              label: "مجموع جریمه معوق",
              value: `Rs. ${studentSummaries.reduce(
                (sum, student) => sum + (student.totalFine ?? 0),
                0,
              )}`,
              icon: CheckCircle2,
            },
          ].map(({ label, value, icon }) => (
            <div key={label} className={s.statCard}>
              <span className={s.statIconWrapper}>
                {createElement(icon, { size: 18 })}
              </span>
              <p className={s.statLabel}>{label}</p>
              <p className={s.statValue}>{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ بخش اصلی ============ */}
      <section className={s.mainSection}>
        <div className={s.headerFlex}>
          <div className="min-w-0">
            <h1 className={s.headerTitle}>
              حساب‌های دانشجویان و کتاب‌های امانتی
            </h1>
            <p className={s.headerSubtitle}>
              فیلتر دانشجویان بر اساس وضعیت دیرکرد، خروجی داده‌های قابل مشاهده به CSV، پاک کردن جریمه پس از پرداخت و تایید بازگشت‌ها از کارت‌های عملیات.
            </p>
          </div>

          <button
            type="button"
            onClick={exportCsv}
            className={s.exportButton}
          >
            <Download size={16} />
            خروجی CSV
          </button>
        </div>

        {/* ============ فیلترها ============ */}
        <div className={s.filtersContainer}>
          <label className={s.filterLabel}>
            <span className={s.filterLabelSpan}>جستجوی دانشجو و کتاب</span>
            <div className={s.searchWrapper}>
              <Search size={16} className={s.searchIcon} />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جستجو بر اساس نام دانشجو، ایمیل، کد کتاب یا نام کتاب"
                className={s.searchInput}
              />
            </div>
          </label>

          <label className={s.filterLabel}>
            <span className={s.filterLabelSpan}>فیلتر دانشجو</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={s.selectInput}
            >
              {studentFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {statusFilter === "Overdue" && (
            <label className={s.filterLabel}>
              <span className={s.filterLabelSpan}>مرتب‌سازی جریمه دیرکرد</span>
              <select
                value={overdueSortOrder}
                onChange={(event) => setOverdueSortOrder(event.target.value)}
                className={s.selectInput}
              >
                {overdueSortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {/* ============ لیست دانشجویان ============ */}
        <div className={s.studentsGrid}>
          {filteredStudents.map((member) => {
            const isExpanded = expandedStudent === member.email;

            return (
              <article key={member.email} className={s.studentCard}>
                <div className={s.studentCardHeader}>
                  <div className="min-w-0">
                    <p className={s.studentName}>{member.name}</p>
                    <p className={s.studentIdEmail}>
                      {member.studentId ?? "تعیین نشده"} | {member.email}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedStudent((current) =>
                        current === member.email ? "" : member.email,
                      )
                    }
                    className={s.expandButton}
                    aria-label={isExpanded ? "بستن جزئیات دانشجو" : "نمایش جزئیات دانشجو"}
                  >
                    <Eye size={18} />
                  </button>
                </div>

                <div className={s.statsRow}>
                  <div className={s.statBlock}>
                    <p className={s.statBlockLabel}>نقش</p>
                    <span
                      className={`${s.badge} ${
                        roleStyles[member.role]
                      }`}
                    >
                      {roleLabels[member.role] ?? member.role}
                    </span>
                  </div>

                  <div className={s.statBlock}>
                    <p className={s.statBlockLabel}>کتاب‌های فعال</p>
                    <p className={s.numericStat}>{member.borrowedCount}</p>
                  </div>

                  <div className={s.statBlock}>
                    <p className={s.statBlockLabel}>مجموع جریمه</p>
                    <p className={s.numericStat}>{member.totalFine} تومان</p>
                  </div>

                  <div className={s.statBlock}>
                    <p className={s.statBlockLabel}>وضعیت</p>
                    <span
                      className={`${s.badge} ${
                        statusStyles[member.status]
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>

                  <div className={s.statBlock}>
                    <p className={s.statBlockLabel}>جریمه پرداخت‌شده</p>
                    <p className={s.numericStat}>{member.fineClearedCount}</p>
                  </div>
                </div>

                {isExpanded && (
                  <div className={s.expandedContainer}>
                    <div className={s.detailsCard}>
                      <p className={s.detailsCardLabel}>جزئیات دانشجو</p>
                      <div className={s.detailsGrid}>
                        <div className={s.detailsItem}>
                          دانشکده: {member.department ?? "عمومی"}
                        </div>
                        <div className={s.detailsItem}>
                          رشته: {member.stream ?? "عمومی"}
                        </div>
                        <div className={s.detailsItem}>
                          سال: {member.academicYear ?? "سال اول"}
                        </div>
                        <div className={s.detailsItem}>
                          شماره دانشجویی: {member.rollNumber ?? "تعیین نشده"}
                        </div>
                        <div className={s.detailsItem}>
                          شماره موبایل: {member.phone || "ثبت نشده"}
                        </div>
                      </div>
                    </div>

                    <div className={s.booksListContainer}>
                      <p className={s.detailsCardLabel}>
                        کتاب‌های امانتی با عملیات
                      </p>
                      <div className={s.booksList}>
                        {member.history.length ? (
                          member.history.map((record) => {
                            const isOverdue = record.liveStatus === "Overdue";
                            const fineAmountToShow = record.fineCleared
                              ? (record.clearedFineAmount ?? 0)
                              : record.liveFine;
                            const showFineHistory =
                              isOverdue ||
                              Boolean(record.fineCleared) ||
                              fineAmountToShow > 0;
                            const fineClearDisabled =
                              !showFineHistory ||
                              Boolean(record.returnedOn) ||
                              record.fineCleared ||
                              fineAmountToShow <= 0;
                            const returnDisabled =
                              Boolean(record.returnedOn) ||
                              (isOverdue && !record.fineCleared);

                            return (
                              <div
                                key={`${member.email}-${record.id}`}
                                className={s.bookCard}
                              >
                                <div className={s.bookHeader}>
                                  <div className="min-w-0">
                                    <p className={s.bookTitle}>
                                      {record.title}
                                    </p>
                                    <p className={s.bookCode}>
                                      {record.bookCode}
                                    </p>
                                  </div>
                                  <span
                                    className={`${s.bookStatusBadge} ${
                                      recordStatusStyles[record.liveStatus]
                                    }`}
                                  >
                                    {record.liveStatus}
                                  </span>
                                </div>

                                <div className={s.bookDetailGrid}>
                                  <div className={s.bookDetailItem}>
                                    امانت: {record.issueLabel}
                                  </div>
                                  <div className={s.bookDetailItem}>
                                    سررسید: {record.dueLabel}
                                  </div>
                                  {showFineHistory && (
                                    <div className={s.bookDetailItem}>
                                      جریمه: {fineAmountToShow} تومان
                                    </div>
                                  )}
                                  {showFineHistory && (
                                    <div className={s.bookDetailItem}>
                                      وضعیت جریمه:{" "}
                                      {record.fineCleared ? "پرداخت‌شده" : "در انتظار"}
                                    </div>
                                  )}
                                  <div className={s.bookDetailItem}>
                                    بازگشت:{" "}
                                    {record.returnedOn ? "بازگردانده‌شده" : "در انتظار"}
                                  </div>
                                  <div className={s.bookDetailItem}>
                                    تاریخ بازگشت: {record.returnedOnLabel || "-"}
                                  </div>
                                </div>

                                <div className={s.bookActions}>
                                  {showFineHistory && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setConfirmAction({
                                          type: "clear-fine",
                                          title: "پاک کردن جریمه این دانشجو؟",
                                          message:
                                            "با تایید، جریمه این رکورد صفر شده و دکمه پاک کردن جریمه غیرفعال می‌شود.",
                                          payload: {
                                            source: record.source,
                                            recordId: record.id,
                                            bookId: record.bookId,
                                          },
                                        })
                                      }
                                      disabled={fineClearDisabled}
                                      className={s.clearFineButton}
                                    >
                                      {record.fineCleared
                                        ? "جریمه پرداخت شده"
                                        : "پاک کردن جریمه"}
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setConfirmAction({
                                        type: "return-book",
                                        title: "بازگشت این کتاب؟",
                                        message:
                                          "با تایید، این کتاب با تاریخ امروز به عنوان بازگردانده‌شده ثبت شده و دکمه بازگشت غیرفعال می‌شود.",
                                        payload: {
                                          source: record.source,
                                          recordId: record.id,
                                          bookId: record.bookId,
                                        },
                                      })
                                    }
                                    disabled={returnDisabled}
                                    className={s.returnButton}
                                  >
                                    {record.returnedOn
                                      ? "بازگردانده‌شده"
                                      : isOverdue
                                        ? "بازگشت کتاب"
                                        : "بازگشت زودهنگام"}
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className={s.emptyHistory}>
                            هیچ سابقه امانتی یافت نشد.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}

          {!filteredStudents.length && (
            <div className={s.emptyState}>
              هیچ دانشجو یا کتاب امانتی با فیلترهای شما مطابقت نداشت.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminUsersPage