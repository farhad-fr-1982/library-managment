import React from 'react'
import { UserRound, Activity, ShieldEllipsis, AlertTriangle } from 'lucide-react';
import { adminDashboardStyles as s } from "../assets/dummyStyles";
import { useLibrary } from "../shared/LibraryContext";
import { Link } from 'react-router-dom';

const icons = [UserRound, Activity, ShieldEllipsis, AlertTriangle];

const AdminDashboardPage = () => {
  const { adminStats, studentSummaries } = useLibrary();

  // فیلتر دانشجویان دیرکرد
  const overdueStudents = studentSummaries.filter(
    (student) => student.status === "دیرکرد",
  );

  // پیدا کردن بدترین رکورد دیرکرد برای هر دانشجو
  const attentionRecords = overdueStudents.map((student) => {
    const topOverdueRecord = student.activeBooks
      .filter((record) => record.liveStatus === "دیرکرد")
      .sort((first, second) => second.liveFine - first.liveFine)[0];

    if (!topOverdueRecord) {
      return null;
    }

    return {
      studentName: student.name,
      studentId: student.studentId,
      email: student.email,
      department: student.department,
      totalFine: student.totalFine,
      borrowedCount: student.borrowedCount,
      ...topOverdueRecord,
    };
  }).filter(Boolean)
    .sort((first, second) => second.totalFine - first.totalFine)
    .slice(0, 4);

  return (
    <div className={s.container}>
      {/* ============ بخش Hero ============ */}
      <section className={s.heroSection}>
        <div className={s.heroInner}>
          <div>
            <span className={s.badge}>فضای کاری مدیریت دانشگاه</span>
            <h1 className={s.heading}>
              مدیریت کتاب‌های امانتی، سوابق دانشجویان، بازگشت‌ها، وضعیت دیرکرد و جریمه‌ها.
            </h1>
            <p className={s.heroParagraph}>
              بخش مدیریت اکنون بر نمودارهای روند بصری تمرکز دارد و در عین حال گردش کار موجود مدیر را بدون تغییر نگه می‌دارد.
            </p>
          </div>
        </div>
      </section>

      {/* ============ بخش آمار ============ */}
      <section className={s.statsGrid}>
        {adminStats.map((item, index) => {
          const Icon = icons[index];

          return (
            <article key={item.label} className={s.statCard}>
              {/* آیکون */}
              <span className={s.statIcon}>
                <Icon size={20} />
              </span>

              {/* برچسب */}
              <p className={s.statLabel}>{item.label}</p>

              {/* مقدار */}
              <p className={s.statValue}>
                {item.isCurrency ? (
                  <>
                    {Number(item.value).toLocaleString("fa-IR")} تومان
                  </>
                ) : (
                  item.value
                )}
              </p>

              {/* توضیح */}
              <p className={s.statNote}>{item.note}</p>
            </article>
          );
        })}
      </section>

      {/* ============ بخش دیرکردها ============ */}
      <section className={s.overdueSection}>
        <div className={s.overdueHeader}>
          <div>
            <h2 className={s.overdueTitle}>لیست هشدار دیرکرد</h2>
            <p className={s.overdueSubtitle}>
              ۴ دانشجوی برتر دیرکرد بر اساس مجموع جریمه اعمال‌شده، که بیشترین جریمه ابتدا نمایش داده می‌شود.
            </p>
          </div>
          <span className={s.alertIcon}>
            <AlertTriangle size={20} />
          </span>
        </div>

        {/* گرید کارت‌ها */}
        <div className={s.overdueGrid}>
          {attentionRecords.length ? (
            attentionRecords.map((record, index) => (
              <div key={`${record.email}-${record.id}`} className={s.overdueCard}>

                {/* برچسب بیشترین جریمه (فقط کارت اول) */}
                {index === 0 ? (
                  <span className={s.mostFineBadge}>
                    بیشترین جریمه اعمال‌شده
                  </span>
                ) : null}

                {/* محتوای کارت */}
                <div className={s.overdueCardInner}>
                  <div>
                    <p className={s.studentName}>
                      {record.studentName}
                    </p>
                    <p className={s.studentDetails}>
                      {record.studentId ?? "تعیین نشده"} | {record.email}
                    </p>
                    <p className={s.studentFine}>
                      {Number(record.totalFine).toLocaleString("fa-IR")} تومان
                    </p>
                  </div>

                  <div className={s.highestFineBookContainer}>
                    <p className={s.highestFineLabel}>
                      کتاب با بیشترین جریمه
                    </p>
                    <p className={s.highestFineTitle}>
                      {record.title}
                    </p>
                  </div>
                </div>

                <div className={s.detailsGrid}>
                  <div className={s.detailItem}>
                    دانشکده: {record.department ?? "عمومی"}
                  </div>
                  <div className={s.detailItem}>کد کتاب: {record.bookCode}</div>
                  <div className={s.detailItem}>
                    بیشترین جریمه کتاب: {Number(record.liveFine).toLocaleString("fa-IR")} تومان
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={s.emptyState}>
              در حال حاضر هیچ کتاب دیرکردی نیاز به توجه فوری ندارد.
            </div>
          )}
        </div>

        {attentionRecords.length ? (
          <div className={s.viewMoreContainer}>
            <Link to='/admin/users?status=Overdue&sort=high-to-low' className={s.viewMoreLink}>
              مشاهده بیشتر
              <ArrowLeft size={16} />
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default AdminDashboardPage