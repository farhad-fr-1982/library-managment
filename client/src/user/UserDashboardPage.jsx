import React from 'react'
import { userDashboardPageStyles as s } from '../assets/dummyStyles'
import { AlertTriangle, BookCopy, GraduationCap, IdCard, ReceiptText, Sparkles } from 'lucide-react'
import { useAuth } from '../shared/AuthContext';
import { useLibrary } from "../shared/LibraryContext";
import { Link } from 'react-router-dom';
import UserBookCard from './UserBookCard';

const UserDashboardPage = () => {
  const { currentUser } = useAuth();
  const { currentUserHistory, currentUserSummary } = useLibrary();

  const activeCount = currentUserHistory.filter(
    (item) => item.liveStatus === "Borrowed",
  ).length;
  const overdueCount = currentUserHistory.filter(
    (item) => item.liveStatus === "Overdue",
  ).length;
  const pendingFine = currentUserSummary?.totalFine ?? 0;
  const clearedFine = currentUserSummary?.totalClearedFine ?? 0;

  const overviewStats = [
    {
      key: "issues",
      label: "کل امانت‌ها",
      value: `${currentUserHistory.length}`,
      note: "تمام سوابق کتابخانه متصل به حساب دانشجویی شما",
      icon: BookCopy,
    },
    {
      key: "borrowed",
      label: "کتاب‌های فعال",
      value: `${activeCount}`,
      note: "کتاب‌هایی که در حال حاضر به پروفایل شما متصل هستند",
      icon: GraduationCap,
    },
    {
      key: "overdue",
      label: "کتاب‌های معوق",
      value: `${overdueCount}`,
      note: "نیاز به پیگیری دارد قبل از اینکه جریمه بیشتری اضافه شود",
      icon: AlertTriangle,
    },
    {
      key: "pending-fine",
      label: "جریمه در انتظار پرداخت",
      value: `${pendingFine.toLocaleString('fa-IR')} تومان`,
      note: "مبلغ جریمه‌ای که هنوز روی سوابق فعال باقی مانده است",
      icon: ReceiptText,
    },
    {
      key: "cleared-fine",
      label: "جریمه تسویه‌شده",
      value: `${clearedFine.toLocaleString('fa-IR')} تومان`,
      note: "کل مبلغ جریمه‌ای که تاکنون در حساب شما تسویه شده است",
      icon: ReceiptText,
    },
  ];

  const recentBooks = currentUserHistory.slice(0, 3);


  return (
    <div className={s.pageContainer}>
      <section className={s.heroSection}>
        <div className={s.heroGrid}>
          <div className={s.heroLeft}>
            <span className={s.heroBadge}>
              <Sparkles size={14} />
              داشبورد دانشجو
            </span>

            <h1 className={s.heroTitle}>
              {currentUser?.name ?? "کاربر"} عزیز، وضعیت ترم و آخرین کتاب‌های کتابخانه شما.
            </h1>
            <p className={s.heroText}>
              داشبورد شما اکنون خلاصه مهم حساب را در بالای صفحه نگه می‌دارد
              و جدیدترین کتاب‌های امانت‌گرفته‌شده را برای دسترسی سریع‌تر
              دقیقاً در زیر آن نمایش می‌دهد.
            </p>
          </div>

          <div className={s.rightColumnGrid}>
            <article className={s.profileCard}>
              <div className={s.profileHeader}>
                <div className="min-w-0">
                  <p className={s.profileLabel}>پروفایل دانشجو</p>
                  <p className={s.profileName}>
                    {currentUser?.name ?? "کاربر دانشگاه"}
                  </p>
                </div>
                <span className={s.profileIconWrapper}>
                  <IdCard size={20} />
                </span>
              </div>

              <div className={s.profileDetails}>
                <div className={s.profileDetailItem}>
                  شناسه دانشجو: {currentUserSummary?.studentId ?? "تعیین نشده"}
                </div>
                <div className={s.profileDetailItem}>
                  شماره دانشجویی: {currentUserSummary?.rollNumber ?? "تعیین نشده"}
                </div>
                <div className={s.profileDetailItem}>
                  دپارتمان: {currentUserSummary?.department ?? "عمومی"}
                </div>
              </div>
            </article>

            <article className={s.semesterCard}>
              <div className={s.semesterHeader}>
                <div>
                  <p className={s.semesterLabel}>جزئیات ترم</p>
                  <p className={s.semesterValue}>
                    {currentUserSummary?.semester ?? "ترم ۱"}
                  </p>
                </div>
                <span className={s.semesterIconWrapper}>
                  <GraduationCap size={20} />
                </span>
              </div>

              <div className={s.semesterDetails}>
                <div className={s.semesterDetailItem}>
                  رشته: {currentUserSummary?.stream ?? "عمومی"}
                </div>
                <div className={s.semesterDetailItem}>
                  سال تحصیلی: {currentUserSummary?.academicYear ?? "عمومی"}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={s.statsGrid}>
        {overviewStats.map((item) => {
          const Icon = item.icon;

          return (
            <article key={item.key} className={s.statCard}>
              <div className={s.statHeader}>
                <span className={s.statIconWrapper}>
                  <Icon size={20} />
                </span>
                <span className={s.statLiveBadge}>فعال</span>
              </div>
              <p className={s.statLabel}>{item.label}</p>
              <p className={s.statValue}>{item.value}</p>
              <p className={s.statNote}>{item.note}</p>
            </article>
          );
        })}
      </section>

      <section className={s.recentSection}>
        <div className={s.recentHeader}>
          <div>
            <h2 className={s.recentTitle}>کتاب‌های اخیر</h2>
            <p className={s.recentSubtitle}>
              سه رکورد آخر از صفحه کتاب‌های شما در اینجا با همان طراحی کارت نمایش داده می‌شود تا بتوانید از داشبورد ادامه دهید.
            </p>
          </div>
          <Link to="/user/books" className={s.viewMoreButton}>
            مشاهده بیشتر
          </Link>
        </div>

        <div className={s.recentGrid}>
          {recentBooks.length ? (
            recentBooks.map((record) => (
              <UserBookCard
                key={record.id}
                record={record}
                borrowerName={currentUser?.name ?? "دانشجو"}
              />
            ))
          ) : (
            <div className={s.emptyRecentState}>
              هیچ کتاب اخیری برای این حساب یافت نشد.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default UserDashboardPage