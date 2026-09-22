import React, { useMemo, useState } from "react";
import { userBooksPageStyles as s } from "../assets/dummyStyles";
import { useAuth } from "../shared/AuthContext";
import { useLibrary } from "../shared/LibraryContext";
import { Search } from "lucide-react";

const UserBooksPage = () => {

    const { currentUser } = useAuth();
    const { currentUserHistory } = useLibrary();
    const [filters, setFilters] = useState({
        search: "",
        status: "همه",
    });

    const filteredIssuedBooks = useMemo(() => {
        return currentUserHistory.filter((record) => {
            const term = filters.search.toLowerCase();
            const matchesSearch =
                !filters.search ||
                record.title.toLowerCase().includes(term) ||
                record.author.toLowerCase().includes(term) ||
                record.bookCode.toLowerCase().includes(term) ||
                currentUser?.name?.toLowerCase().includes(term);

            const matchesStatus =
                filters.status === "All" || record.liveStatus === filters.status;

            return matchesSearch && matchesStatus;
        });
    }, [currentUser?.name, currentUserHistory, filters]);

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters((current) => ({
            ...current,
            [name]: value,
        }));
    };

    return (
        <div className={s.pageContainer}>
            <section className={s.heroSection}>
                <div className={s.heroFlex}>
                    <div>
                        <span className={s.heroBadge}>صفحه کتاب‌های دانشجو</span>
                        <h1 className={s.heroTitle}>
                            کارت‌های کتاب با محتوای غنی‌تر و جزئیات گروه‌بندی‌شده‌ی تمیزتر
                        </h1>
                        <p className={s.heroText}>
                            هر کارت اکنون از یک خلاصه‌ی بالایی واضح‌تر، نشان وضعیت، چیپ‌های زمینه و چیدمان بهتر کارت‌های متوسط استفاده می‌کند تا جزئیات ساختاریافته‌تر و ظریف‌تر به نظر برسند.
                        </p>
                    </div>
                </div>
            </section>

            <section className={s.mainSection}>
                <div className={s.sectionHeader}>
                    <div>
                        <h2 className={s.sectionTitle}>کتاب‌های امانت‌گرفته‌شده من</h2>
                        <p className={s.sectionSubtitle}>
                            کارت‌های با اندازه متوسط اکنون جزئیات اصلی را از داده‌های پشتیبان رکورد جدا می‌کنند.
                        </p>
                    </div>
                </div>

                <div className={s.filtersContainer}>
                    <label className={s.filterLabel}>
                        <span className={s.filterLabelSpan}>جستجوی کتاب‌های من</span>
                        <div className={s.searchWrapper}>
                            <Search size={16} className={s.searchIcon} />
                            <input type="text" name="search" value={filters.search}
                                onChange={handleFilterChange} placeholder="جستجو بر اساس نام کتاب، کد، امانت‌گیرنده یا نویسنده"
                                className={s.searchInput}
                            />
                        </div>
                    </label>

                    <label className={s.filterLabel}>
                        <span className={s.filterLabelSpan}>وضعیت</span>
                        <select name="status" value={filters.status}
                            onChange={handleFilterChange} className={s.selectInput}>
                            <option value="All">همه وضعیت‌ها</option>
                            <option value="Borrowed">امانت‌گرفته‌شده</option>
                            <option value="Overdue">معوق</option>
                            <option value="Returned">بازگردانده‌شده</option>
                        </select>
                    </label>
                </div>

                <div className={s.booksGrid}>
                    {filteredIssuedBooks.length ? (
                        filteredIssuedBooks.map((record) => (
                            <UserBookCard key={record.id} record={record} borrowerName={currentUser?.name ?? "دانشجو"} />
                        ))
                    ) : (
                        <div className={s.emptyState}>
                            هیچ کتاب امانت‌گرفته‌شده‌ای با جستجوی شما مطابقت نداشت
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default UserBooksPage;