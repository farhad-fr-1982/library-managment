import React, { useEffect, useRef, useState } from 'react'
import { FilePlus2, Search, Trash2 } from 'lucide-react';
import DatePickerModule from "react-multi-date-picker";
const DatePicker = DatePickerModule.default || DatePickerModule;

import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { adminBooksPageStyles as s } from "../assets/dummyStyles";
import { useLibrary } from "../shared/LibraryContext";

// تبدیل اعداد فارسی به انگلیسی
const toEnglishDigits = (str) =>
    String(str).replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));

// تاریخ امروز شمسی (فرمت: YYYY-MM-DD)
const getTodayIso = () => {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    const parts = formatter.formatToParts(date);
    const year = parts.find((p) => p.type === "year")?.value || "";
    const month = parts.find((p) => p.type === "month")?.value || "";
    const day = parts.find((p) => p.type === "day")?.value || "";
    return `${toEnglishDigits(year)}-${toEnglishDigits(month)}-${toEnglishDigits(day)}`;
};

const createBookDraft = () => ({
    id: `draft-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    title: "",
    bookCode: "",
    issuedOn: getTodayIso(),
    dueDate: "",
});

const createInitialForm = () => ({
    studentName: "",
    userEmail: "",
    department: "",
    stream: "",
    academicYear: "",
    semester: "",
    rollNumber: "",
    books: [createBookDraft()],
});

const AdminBooksPage = () => {

    const { issueManualBooksToStudent, fineSettings } = useLibrary();
    const [issueForm, setIssueForm] = useState(createInitialForm);
    const [formMessage, setFormMessage] = useState("");
    const [matchingStudents, setMatchingStudents] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchError, setSearchError] = useState("");
    const searchTimeoutRef = useRef(null);
    const isStudentSelected = Boolean(selectedStudent);
    const canSearchRoll =
        issueForm.rollNumber.trim().length > 0 && !isStudentSelected;

    // ============ جستجوی دانشجو با شماره دانشجویی ============
    useEffect(() => {
        if (!canSearchRoll) return;
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = window.setTimeout(async () => {
            try {
                setSearchError("");
                const response = await fetch(
                    `http://localhost:5000/api/students/search-by-roll?roll=${encodeURIComponent(
                        issueForm.rollNumber.trim(),
                    )}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("library-auth-token")}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                const data = await response.json();
                if (response.ok && data.success) {
                    setMatchingStudents(data.students || []);
                } else {
                    setMatchingStudents([]);
                    setSearchError(
                        data.message || "امکان جستجوی دانشجو با این شماره وجود ندارد."
                    );
                }
            } catch (error) {
                console.error("خطا در جستجوی دانشجو:", error);
                setMatchingStudents([]);
                setSearchError("امکان دریافت دانشجویان مطابق وجود ندارد.");
            } finally {
                setIsSearching(false);
            }
        }, 300);
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [issueForm.rollNumber, canSearchRoll]);

    // ============ پاک کردن دانشجوی انتخاب‌شده ============
    const clearSelectedStudent = () => {
        setSelectedStudent(null);
        setMatchingStudents([]);
        setSearchError("");
        setIssueForm((current) => ({
            ...current,
            studentName: "",
            userEmail: "",
            department: "",
            stream: "",
            academicYear: "",
            semester: "",
            rollNumber: "",
        }));
    };

    // ============ انتخاب دانشجو ============
    const selectStudent = (student) => {
        setFormMessage("");
        setSearchError("");
        setMatchingStudents([]);
        setSelectedStudent(student);
        setIssueForm((current) => ({
            ...current,
            studentName: student.name,
            userEmail: student.email,
            department: student.department || "",
            stream: student.stream || "",
            academicYear: student.academicYear || "",
            semester: student.semester || "",
            rollNumber: student.rollNumber || "",
        }));
    };

    // ============ مدیریت تغییرات فرم دانشجو ============
    const handleIssueChange = (event) => {
        const { name, value } = event.target;
        setFormMessage("");
        if (name === "rollNumber") {
            setSelectedStudent(null);
            setMatchingStudents([]);
            setSearchError("");
            setIsSearching(Boolean(value.trim()));
        }
        setIssueForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    // ============ مدیریت تغییرات کتاب ============
    const handleBookChange = (bookId, field, value) => {
        setFormMessage("");
        setIssueForm((current) => ({
            ...current,
            books: current.books.map((book) =>
                book.id === bookId ? { ...book, [field]: value } : book,
            ),
        }));
    };

    // ============ افزودن کتاب جدید ============
    const addBookDraft = () => {
        setIssueForm((current) => ({
            ...current,
            books: [...current.books, createBookDraft()],
        }));
    };

    // ============ حذف کتاب ============
    const removeBookDraft = (bookId) => {
        setIssueForm((current) => ({
            ...current,
            books:
                current.books.length > 1
                    ? current.books.filter((book) => book.id !== bookId)
                    : current.books,
        }));
    };

    // ============ ارسال فرم (امانت دستی) ============
    const handleIssueSubmit = async (event) => {
        event.preventDefault();
        if (!issueForm.userEmail) {
            setFormMessage(
                "قبل از امانت کتاب، دانشجو را با شماره دانشجویی جستجو و انتخاب کنید"
            );
            return;
        }

        // ✅ تبدیل اعداد فارسی به انگلیسی در books
        const normalizedBooks = issueForm.books.map(book => ({
            ...book,
            dueDate: toEnglishDigits(book.dueDate),
            issuedOn: toEnglishDigits(book.issuedOn),
        }));

        const result = await issueManualBooksToStudent({
            userEmail: issueForm.userEmail,
            studentDetails: issueForm,
            books: normalizedBooks,
        });

        if (!result.ok) {
            setFormMessage(result.error ?? "در حال حاضر امکان امانت کتاب‌ها وجود ندارد.");
            return;
        }
        setFormMessage(
            `${result.count} رکورد امانت کتاب دستی با موفقیت ثبت شد!`,
        );
        setIssueForm(createInitialForm());
        setSelectedStudent(null);
        setMatchingStudents([]);
        setSearchError("");
    };

    return (
        <div className={s.pageContainer}>
            <section className={s.mainSection}>
                <div className={s.innerContainer}>
                    {/* ============ سربرگ ============ */}
                    <div className={s.headerFlex}>
                        <div>
                            <h2 className={s.title}>امانت کتاب به دانشجو</h2>
                            <p className={s.subtitle}>
                                یک دانشجو را انتخاب کنید، ورودی‌های کتاب دستی را با کد کتاب اضافه کنید، و قانون جریمه دیرکرد فعال به‌صورت خودکار پس از تاریخ سررسید اعمال می‌شود.
                            </p>
                        </div>

                        {/* برچسب نرخ جریمه */}
                        <div className={s.fineRuleBadge}>
                            نرخ جریمه: {fineSettings.amount.toLocaleString("fa-IR")} تومان / روز
                        </div>
                    </div>

                    {/* ============ فرم ============ */}
                    <form className={s.form} onSubmit={handleIssueSubmit}>
                        <div className={s.formGrid}>

                            {/* نام دانشجو */}
                            <label className={s.label}>
                                <span className={s.labelSpan}>نام دانشجو</span>
                                <div className={s.searchInputWrapper}>
                                    <Search className={s.searchIcon} size={16} />
                                    <input
                                        type="text"
                                        name="studentName"
                                        value={issueForm.studentName}
                                        readOnly
                                        placeholder="نام دانشجوی انتخاب‌شده"
                                        className={s.readonlyInput}
                                    />
                                </div>
                            </label>

                            {/* دانشکده */}
                            <label className={s.label}>
                                <span className={s.labelSpan}>دانشکده</span>
                                <input
                                    type="text"
                                    name="department"
                                    value={issueForm.department}
                                    readOnly={isStudentSelected}
                                    onChange={handleIssueChange}
                                    placeholder="دانشکده"
                                    className={s.textInput}
                                />
                            </label>

                            {/* رشته */}
                            <label className={s.label}>
                                <span className={s.labelSpan}>رشته</span>
                                <input
                                    type="text"
                                    name="stream"
                                    value={issueForm.stream}
                                    readOnly={isStudentSelected}
                                    onChange={handleIssueChange}
                                    placeholder="رشته"
                                    className={s.textInput}
                                />
                            </label>

                            {/* سال تحصیلی */}
                            <label className={s.label}>
                                <span className={s.labelSpan}>سال تحصیلی</span>
                                <input
                                    type="text"
                                    name="academicYear"
                                    value={issueForm.academicYear}
                                    readOnly={isStudentSelected}
                                    onChange={handleIssueChange}
                                    placeholder="سال تحصیلی"
                                    className={s.textInput}
                                />
                            </label>

                            {/* ترم */}
                            <label className={s.label}>
                                <span className={s.labelSpan}>ترم</span>
                                <input
                                    type="text"
                                    name="semester"
                                    value={issueForm.semester}
                                    readOnly={isStudentSelected}
                                    onChange={handleIssueChange}
                                    placeholder="ترم"
                                    className={s.textInput}
                                />
                            </label>

                            {/* شماره دانشجویی */}
                            <label className={s.label}>
                                <span className={s.labelSpan}>شماره دانشجویی</span>
                                <input
                                    type="text"
                                    name="rollNumber"
                                    value={issueForm.rollNumber}
                                    readOnly={isStudentSelected}
                                    onChange={handleIssueChange}
                                    placeholder="جستجو با شماره دانشجویی"
                                    className={s.textInput}
                                />
                            </label>
                        </div>

                        {/* ============ نمایش نتایج جستجو ============ */}
                        <div className={s.matchingContainer}>
                            <p className={s.matchingTitle}>دانشجویان مطابق</p>
                            <div className={s.studentList}>
                                {isSearching ? (
                                    <span className={s.searchingMessage}>
                                        در حال جستجوی دانشجویان...
                                    </span>
                                ) : matchingStudents.length ? (
                                    matchingStudents.map((student) => (
                                        <button
                                            key={student.email}
                                            type="button"
                                            onClick={() => selectStudent(student)}
                                            className={`${s.studentButtonBase} ${
                                                selectedStudent?.email === student.email
                                                    ? s.studentButtonSelected
                                                    : s.studentButtonUnselected
                                            }`}
                                        >
                                            <span>{student.name}</span>
                                            <span className={s.studentRollSpan}>
                                                - {student.rollNumber}
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <p className={s.noMatchText}>
                                        {issueForm.rollNumber.trim()
                                            ? "هیچ دانشجوی مطابقی یافت نشد."
                                            : "برای جستجوی دانشجویان ثبت‌نام‌شده، شماره دانشجویی را وارد کنید."}
                                    </p>
                                )}
                            </div>
                            {searchError && <p className={s.errorText}>{searchError}</p>}

                            {selectedStudent && (
                                <div className={s.selectedStudentContainer}>
                                    <span className={s.selectedStudentBadge}>
                                        انتخاب‌شده: {selectedStudent.name} - {selectedStudent.rollNumber}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={clearSelectedStudent}
                                        className={s.clearButton}
                                    >
                                        پاک کردن انتخاب
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ============ بخش کتاب‌ها ============ */}
                        <div className={s.booksSection}>
                            <div className={s.booksHeader}>
                                <h3 className={s.booksTitle}>ورودی‌های کتاب دستی</h3>
                                <button
                                    type="button"
                                    onClick={addBookDraft}
                                    className={s.addBookButton}>
                                    <FilePlus2 size={16} />
                                    افزودن کتاب
                                </button>
                            </div>

                            <div className={s.booksGrid}>
                                {issueForm.books.map((book, index) => (
                                    <article key={book.id} className={s.bookCard}>
                                        <div className={s.bookCardHeader}>
                                            <div className={s.bookIndexWrapper}>
                                                <p className={s.bookIndexLabel}>
                                                    کتاب دستی {index + 1}
                                                </p>
                                                <p className={s.bookIndexHelper}>
                                                    نام و کد کتاب را اضافه کنید. تاریخ امانت به‌صورت خودکار روی امروز تنظیم می‌شود.
                                                </p>
                                            </div>
                                            {issueForm.books.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeBookDraft(book.id)}
                                                    className={s.deleteButton}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        <div className={s.bookFieldsGrid}>
                                            {/* نام کتاب */}
                                            <label className={s.bookFieldLabel}>
                                                <span className={s.labelSpan}>نام کتاب</span>
                                                <input
                                                    type="text"
                                                    value={book.title}
                                                    onChange={(event) =>
                                                        handleBookChange(book.id, "title", event.target.value)
                                                    }
                                                    placeholder="نام کتاب را وارد کنید"
                                                    className={s.bookFieldInput}
                                                />
                                            </label>

                                            {/* کد کتاب */}
                                            <label className={s.bookFieldLabel}>
                                                <span className={s.labelSpan}>کد کتاب</span>
                                                <input
                                                    type="text"
                                                    value={book.bookCode}
                                                    onChange={(event) =>
                                                        handleBookChange(book.id, "bookCode", event.target.value)
                                                    }
                                                    placeholder="کد کتاب را وارد کنید"
                                                    className={s.bookFieldInput}
                                                />
                                            </label>

                                            {/* ============ تاریخ‌ها ============ */}
                                            <div className={s.dateGrid}>

                                                {/* تاریخ امانت (غیرقابل ویرایش) */}
                                                <label className={s.bookFieldLabel}>
                                                    <span className={s.labelSpan}>تاریخ امانت</span>
                                                    <DatePicker
                                                        value={book.issuedOn}
                                                        calendar={persian}
                                                        locale={persian_fa}
                                                        calendarPosition="bottom-right"
                                                        inputClass={s.dateInputDisabled}
                                                        disabled
                                                        readOnly
                                                        format="YYYY/MM/DD"
                                                    />
                                                </label>

                                                {/* تاریخ سررسید (با تقویم شمسی) */}
                                                <label className={s.bookFieldLabel}>
                                                    <span className={s.labelSpan}>تاریخ سررسید</span>
                                                    <DatePicker
                                                        value={book.dueDate}
                                                        onChange={(date) =>
                                                            handleBookChange(
                                                                book.id,
                                                                "dueDate",
                                                                date?.format("YYYY-MM-DD") || ""
                                                            )
                                                        }
                                                        calendar={persian}
                                                        locale={persian_fa}
                                                        calendarPosition="bottom-right"
                                                        inputClass={s.dateInput}
                                                        placeholder="انتخاب تاریخ سررسید"
                                                        minDate={new Date()}
                                                        format="YYYY/MM/DD"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        {/* ============ پیام فرم ============ */}
                        {formMessage && (
                            <div className={s.formMessage}>{formMessage}</div>
                        )}

                        {/* ============ دکمه ارسال ============ */}
                        <button type="submit" className={s.submitButton}>
                            امانت دستی کتاب‌ها
                        </button>
                    </form>
                </div>
            </section>
        </div>
    )
}

export default AdminBooksPage