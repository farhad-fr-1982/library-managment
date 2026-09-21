import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const LibraryContext = createContext(null);

// تابع کمکی برای تبدیل اعداد به فارسی
const toPersianNumber = (num) => {
  if (num === null || num === undefined || num === "") return "";
  const number = Number(num);
  if (Number.isNaN(number)) return num;
  return number.toLocaleString("fa-IR");
};

// تابع کمکی برای تبدیل قیمت به تومان
const toPersianCurrency = (amount) => {
  const number = Number(amount) || 0;
  return `${number.toLocaleString("fa-IR")} تومان`;
};

const LIBRARY_BOOKS_KEY = "library-management-books";
const LIBRARY_MANUAL_ISSUES_KEY = "library-management-manual-issues";
const LIBRARY_FINE_SETTINGS_KEY = "library-management-fine-settings";

const defaultFineSettings = {
  amount: 10,
  interval: "day",
};

const defaultBooks = [
  {
    id: 1,
    bookCode: "۱۰۰۱",
    title: "ریاضیات مهندسی ۱",
    category: "ریاضیات",
    department: "فنی و مهندسی",
    stream: "کارشناسی",
    year: "سال اول",
    shelf: "A-01",
    copies: 5,
    availableCopies: 5,
    borrowings: [],
  },
  {
    id: 2,
    bookCode: "۱۰۰۲",
    title: "ساختمان داده با زبان C",
    category: "علوم کامپیوتر",
    department: "کامپیوتر",
    stream: "کارشناسی",
    year: "سال اول",
    shelf: "B-04",
    copies: 5,
    availableCopies: 5,
    borrowings: [],
  },
  {
    id: 3,
    bookCode: "۱۰۰۳",
    title: "طراحی منطقی دیجیتال",
    category: "الکترونیک",
    department: "برق",
    stream: "کارشناسی",
    year: "سال اول",
    shelf: "C-19",
    copies: 4,
    availableCopies: 4,
    borrowings: [],
  },
  {
    id: 4,
    bookCode: "۱۰۰۴",
    title: "مفاهیم سیستم عامل",
    category: "علوم کامپیوتر",
    department: "کامپیوتر",
    stream: "کارشناسی",
    year: "سال دوم",
    shelf: "D-08",
    copies: 3,
    availableCopies: 3,
    borrowings: [],
  },
  {
    id: 5,
    bookCode: "۱۰۰۵",
    title: "اصول اقتصاد",
    category: "بازرگانی",
    department: "حسابداری",
    stream: "کارشناسی",
    year: "سال اول",
    shelf: "E-11",
    copies: 5,
    availableCopies: 5,
    borrowings: [],
  },
  {
    id: 6,
    bookCode: "۱۰۰۶",
    title: "مطالعات زیست‌محیطی",
    category: "دروس عمومی",
    department: "همه رشته‌ها",
    stream: "عمومی",
    year: "همه سال‌ها",
    shelf: "F-02",
    copies: 8,
    availableCopies: 8,
    borrowings: [],
  },
  {
    id: 7,
    bookCode: "۱۰۰۷",
    title: "سیستم‌های مدیریت پایگاه داده",
    category: "علوم کامپیوتر",
    department: "کامپیوتر",
    stream: "کارشناسی",
    year: "سال اول",
    shelf: "B-09",
    copies: 6,
    availableCopies: 6,
    borrowings: [],
  },
  {
    id: 8,
    bookCode: "۱۰۰۸",
    title: "مبانی شبکه‌های کامپیوتری",
    category: "علوم کامپیوتر",
    department: "کامپیوتر",
    stream: "کارشناسی",
    year: "سال اول",
    shelf: "B-11",
    copies: 5,
    availableCopies: 5,
    borrowings: [],
  },
  {
    id: 9,
    bookCode: "۱۰۰۹",
    title: "مبانی برنامه‌نویسی جاوا",
    category: "علوم کامپیوتر",
    department: "کامپیوتر",
    stream: "کارشناسی",
    year: "سال دوم",
    shelf: "C-07",
    copies: 5,
    availableCopies: 5,
    borrowings: [],
  },
  {
    id: 10,
    bookCode: "۱۰۱۰",
    title: "ریزپردازنده‌ها و واسط‌ها",
    category: "الکترونیک",
    department: "برق",
    stream: "کارشناسی",
    year: "سال اول",
    shelf: "C-22",
    copies: 4,
    availableCopies: 4,
    borrowings: [],
  },
  {
    id: 11,
    bookCode: "۱۰۱۱",
    title: "آمار کسب و کار",
    category: "بازرگانی",
    department: "حسابداری",
    stream: "کارشناسی",
    year: "سال اول",
    shelf: "E-15",
    copies: 6,
    availableCopies: 6,
    borrowings: [],
  },
  {
    id: 12,
    bookCode: "۱۰۱۲",
    title: "مبانی مهندسی نرم‌افزار",
    category: "علوم کامپیوتر",
    department: "کامپیوتر",
    stream: "کارشناسی",
    year: "سال سوم",
    shelf: "B-15",
    copies: 5,
    availableCopies: 5,
    borrowings: [],
  },
  {
    id: 13,
    bookCode: "۱۰۱۳",
    title: "مبانی ترمودینامیک",
    category: "مکانیک",
    department: "مهندسی مکانیک",
    stream: "کارشناسی",
    year: "سال دوم",
    shelf: "M-03",
    copies: 4,
    availableCopies: 4,
    borrowings: [],
  },
  {
    id: 14,
    bookCode: "۱۰۱۴",
    title: "تحلیل سازه‌ها",
    category: "عمران",
    department: "مهندسی عمران",
    stream: "کارشناسی",
    year: "سال سوم",
    shelf: "C-31",
    copies: 4,
    availableCopies: 4,
    borrowings: [],
  },
  {
    id: 15,
    bookCode: "۱۰۱۵",
    title: "اصول مدیریت کسب و کار",
    category: "مدیریت",
    department: "مدیریت",
    stream: "کارشناسی ارشد",
    year: "سال اول",
    shelf: "G-08",
    copies: 6,
    availableCopies: 6,
    borrowings: [],
  },
  {
    id: 16,
    bookCode: "۱۰۱۶",
    title: "فناوری وب و کاربردها",
    category: "فناوری اطلاعات",
    department: "فناوری اطلاعات",
    stream: "کارشناسی",
    year: "سال دوم",
    shelf: "IT-06",
    copies: 5,
    availableCopies: 5,
    borrowings: [],
  },
  {
    id: 17,
    bookCode: "۱۰۱۷",
    title: "حسابداری شرکت‌ها",
    category: "بازرگانی",
    department: "حسابداری",
    stream: "کارشناسی",
    year: "سال دوم",
    shelf: "E-21",
    copies: 5,
    availableCopies: 5,
    borrowings: [],
  },
  {
    id: 18,
    bookCode: "۱۰۱۸",
    title: "ژنتیک و بیولوژی مولکولی",
    category: "بیوتکنولوژی",
    department: "بیوتکنولوژی",
    stream: "کارشناسی",
    year: "سال اول",
    shelf: "BIO-04",
    copies: 4,
    availableCopies: 4,
    borrowings: [],
  },
  {
    id: 19,
    bookCode: "۱۰۱۹",
    title: "برنامه‌نویسی پیشرفته جاوا",
    category: "علوم کامپیوتر",
    department: "کامپیوتر",
    stream: "کارشناسی",
    year: "سال سوم",
    shelf: "B-18",
    copies: 5,
    availableCopies: 5,
    borrowings: [],
  },
];

const readJson = (key, fallback) => {
  const value = localStorage.getItem(key);

  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const isValidStoredBook = (book) =>
  book &&
  typeof book.id === "number" &&
  typeof book.bookCode === "string" &&
  Array.isArray(book.borrowings);

const normalizeBorrowing = (record, fineSettings) => ({
  ...record,
  fineRate: Number(record?.fineRate ?? record?.finePerDay ?? fineSettings.amount) || 0,
  fineInterval: record?.fineInterval ?? fineSettings.interval,
  manualFine: Number(record?.manualFine ?? 0) || 0,
  fineCleared: Boolean(record?.fineCleared),
  clearedFineAmount: Number(record?.clearedFineAmount ?? 0) || 0,
});

const normalizeStoredBook = (book, fineSettings) => {
  const fallback = defaultBooks.find((item) => item.id === book?.id);

  if (!fallback) {
    return {
      ...book,
      borrowings: Array.isArray(book.borrowings)
        ? book.borrowings.map((record) => normalizeBorrowing(record, fineSettings))
        : [],
    };
  }

  return {
    ...fallback,
    ...book,
    borrowings: Array.isArray(book.borrowings)
      ? book.borrowings.map((record) => normalizeBorrowing(record, fineSettings))
      : fallback.borrowings.map((record) => normalizeBorrowing(record, fineSettings)),
  };
};

const hydrateBooks = (storedBooks, fineSettings) => {
  if (!Array.isArray(storedBooks) || !storedBooks.every(isValidStoredBook)) {
    return defaultBooks.map((book) => normalizeStoredBook(book, fineSettings));
  }

  const normalizedStoredBooks = storedBooks.map((book) => normalizeStoredBook(book, fineSettings));
  const missingDefaultBooks = defaultBooks
    .filter((defaultBook) => !normalizedStoredBooks.some((book) => book.id === defaultBook.id))
    .map((book) => normalizeStoredBook(book, fineSettings));

  return [...normalizedStoredBooks, ...missingDefaultBooks];
};

const hydrateManualIssues = (storedIssues, fineSettings) => {
  if (!Array.isArray(storedIssues)) {
    return [];
  }

  return storedIssues
    .filter(
      (issue) =>
        issue &&
        typeof issue.id === "string" &&
        typeof issue.userEmail === "string" &&
        typeof issue.userName === "string" &&
        typeof issue.title === "string",
    )
    .map((issue) => normalizeBorrowing(issue, fineSettings));
};

const hydrateFineSettings = (storedSettings) => {
  if (!storedSettings || typeof storedSettings !== "object") {
    return defaultFineSettings;
  }

  return {
    amount:
      Number.isFinite(Number(storedSettings.amount)) && Number(storedSettings.amount) >= 0
        ? Number(storedSettings.amount)
        : defaultFineSettings.amount,
    interval:
      ["day", "week", "month", "year"].includes(storedSettings.interval)
        ? storedSettings.interval
        : defaultFineSettings.interval,
  };
};

const getStartOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const today = () => getStartOfDay(new Date());
const getLocalIsoDate = (value = new Date()) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ⬅️ تاریخ شمسی با اعداد فارسی
const formatDate = (value) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("fa-IR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

const getDiffInDays = (targetDate) => {
  const diff = getStartOfDay(targetDate).getTime() - today().getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
};

const getActiveLoan = (book) =>
  [...book.borrowings].reverse().find((record) => !record.returnedOn) ?? null;

const getOverdueUnits = (overdueDays, interval) => {
  if (overdueDays <= 0) {
    return 0;
  }

  if (interval === "week") {
    return Math.ceil(overdueDays / 7);
  }

  if (interval === "month") {
    return Math.ceil(overdueDays / 30);
  }

  if (interval === "year") {
    return Math.ceil(overdueDays / 365);
  }

  return overdueDays;
};

const getFineAmount = (record, fineSettings) => {
  if (!record || record.fineCleared) {
    return 0;
  }

  const overdueDays = Math.max(0, getDiffInDays(record.dueDate) * -1);
  const fineRate = Number(record.fineRate ?? record.finePerDay ?? fineSettings.amount) || 0;
  const fineInterval = record.fineInterval ?? fineSettings.interval;
  const automaticFine = getOverdueUnits(overdueDays, fineInterval) * fineRate;

  return automaticFine + (Number(record.manualFine) || 0);
};

// ⬅️ timeline با اعداد فارسی
const getTimeline = (record) => {
  if (!record) {
    return "آماده برای امانت";
  }

  const diff = getDiffInDays(record.dueDate);

  if (diff < 0) {
    return `دیرکرد به مدت ${toPersianNumber(Math.abs(diff))} روز`;
  }

  if (diff === 0) {
    return "سررسید امروز";
  }

  return `${toPersianNumber(diff)} روز باقی‌مانده`;
};

const getBookView = (book, fineSettings) => {
  const activeLoan = getActiveLoan(book);
  const fineAmount = getFineAmount(activeLoan, fineSettings);
  const status = activeLoan
    ? getDiffInDays(activeLoan.dueDate) < 0
      ? "دیرکرد"
      : "امانت‌شده"
    : "موجود";

  return {
    ...book,
    activeLoan,
    status,
    borrowerLabel: activeLoan ? `امانت به ${activeLoan.userName}` : "آماده برای امانت",
    returnDate: activeLoan ? formatDate(activeLoan.dueDate) : "موجود",
    issuedDate: activeLoan ? formatDate(activeLoan.issuedOn) : "-",
    timeline: getTimeline(activeLoan),
    fineAmount,
    // ⬅️ قیمت با اعداد فارسی و تومان
    fineLabel: fineAmount ? toPersianCurrency(fineAmount) : "بدون جریمه",
    canReturn: Boolean(activeLoan),
  };
};

const createCatalogRecord = (book, record, fineSettings) => ({
  ...record,
  source: "catalog",
  recordType: "کتاب فهرست",
  bookId: book.id,
  bookCode: book.bookCode,
  title: book.title,
  author: book.author,
  category: book.category,
  department: book.department,
  stream: book.stream,
  year: book.year,
  semester: "",
  rollNumber: "",
  shelf: book.shelf,
  copies: book.copies,
  availableCopies: book.availableCopies,
  dueLabel: formatDate(record.dueDate),
  issueLabel: formatDate(record.issuedOn),
  returnedOnLabel: record.returnedOn ? formatDate(record.returnedOn) : "",
  liveStatus:
    !record.returnedOn && getDiffInDays(record.dueDate) < 0
      ? "دیرکرد"
      : !record.returnedOn
        ? "امانت‌شده"
        : "بازگردانده‌شده",
  fineCleared: Boolean(record.fineCleared),
  liveFine: !record.returnedOn ? getFineAmount(record, fineSettings) : 0,
});

const createManualRecord = (issue, fineSettings) => ({
  ...issue,
  source: "manual",
  recordType: "ثبت دستی",
  bookId: null,
  bookCode: issue.bookCode ?? "دستی",
  author: issue.author ?? "ثبت دستی",
  category: issue.category ?? "دستی",
  department: issue.department ?? issue.studentDepartment ?? "عمومی",
  stream: issue.stream ?? issue.studentStream ?? "عمومی",
  year: issue.year ?? issue.studentYear ?? "سال اول",
  semester: issue.semester ?? issue.studentSemester ?? "ترم ۱",
  rollNumber: issue.rollNumber ?? issue.studentRollNumber ?? "تعیین نشده",
  shelf: "",
  copies: 0,
  availableCopies: 0,
  dueLabel: formatDate(issue.dueDate),
  issueLabel: formatDate(issue.issuedOn),
  returnedOnLabel: issue.returnedOn ? formatDate(issue.returnedOn) : "",
  liveStatus:
    !issue.returnedOn && getDiffInDays(issue.dueDate) < 0
      ? "دیرکرد"
      : !issue.returnedOn
        ? "امانت‌شده"
        : "بازگردانده‌شده",
  fineCleared: Boolean(issue.fineCleared),
  liveFine: !issue.returnedOn ? getFineAmount(issue, fineSettings) : 0,
});

const API_BOOKS_URL = "http://localhost:5000/api/books";

const getHeaders = () => {
  const token = localStorage.getItem("library-auth-token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const LibraryProvider = ({ children }) => {
  const { accounts, currentUser } = useAuth();
  const [books, setBooks] = useState(defaultBooks);
  const [manualIssues, setManualIssues] = useState([]);
  const [fineSettings, setFineSettings] = useState(defaultFineSettings);

  const fetchManualIssues = async () => {
    if (!currentUser) return;
    try {
      const isAdmin = currentUser.role === "admin";
      const issuesUrl = isAdmin ? `${API_BOOKS_URL}/issues` : `${API_BOOKS_URL}/issues/student`;
      const response = await fetch(issuesUrl, {
        headers: getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.issues)) {
          const formattedIssues = data.issues.map((issue) => ({
            id: issue._id,
            _id: issue._id,
            userEmail: issue.userEmail,
            userName: issue.userName,
            title: issue.title,
            bookCode: issue.bookCode,
            issuedOn: issue.issuedOn,
            dueDate: issue.dueDate,
            returnedOn: issue.returnedOn,
            finePerDay: issue.fineRate,
            fineRate: issue.fineRate,
            fineInterval: issue.fineInterval,
            manualFine: issue.manualFine,
            fineCleared: issue.fineCleared,
            clearedFineAmount: issue.clearedFineAmount,
            department: issue.department,
            stream: issue.stream,
            year: issue.year,
            semester: issue.semester,
            rollNumber: issue.rollNumber,
            studentId: issue.studentId,
            source: issue.source || "manual",
            bookId: issue.bookId || null,
          }));
          setManualIssues(formattedIssues);
        }
      }
    } catch (error) {
      console.error("خطا در دریافت امانت‌های دستی از سرور:", error);
    }
  };

  const fetchFineSettings = async () => {
    try {
      const response = await fetch(`${API_BOOKS_URL}/fine-settings`, {
        headers: getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          const fetchedSettings = hydrateFineSettings(data.settings);
          setFineSettings(fetchedSettings);
          localStorage.setItem(LIBRARY_FINE_SETTINGS_KEY, JSON.stringify(fetchedSettings));
        }
      }
    } catch (error) {
      console.error("خطا در دریافت تنظیمات جریمه از سرور:", error);
    }
  };

  useEffect(() => {
    const storedFineSettings = hydrateFineSettings(
      readJson(LIBRARY_FINE_SETTINGS_KEY, defaultFineSettings),
    );
    const storedBooks = hydrateBooks(readJson(LIBRARY_BOOKS_KEY, defaultBooks), storedFineSettings);

    localStorage.setItem(LIBRARY_BOOKS_KEY, JSON.stringify(storedBooks));
    localStorage.setItem(LIBRARY_FINE_SETTINGS_KEY, JSON.stringify(storedFineSettings));
    setBooks(storedBooks);
    setFineSettings(storedFineSettings);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchManualIssues();
      fetchFineSettings();
    } else {
      setManualIssues([]);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(LIBRARY_BOOKS_KEY, JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem(LIBRARY_FINE_SETTINGS_KEY, JSON.stringify(fineSettings));
  }, [fineSettings]);

  const returnBook = (bookId, recordId = null) => {
    const todayIso = getLocalIsoDate();

    setBooks((currentBooks) =>
      currentBooks.map((book) => {
        if (book.id !== bookId) {
          return book;
        }

        const activeLoan =
          book.borrowings.find((record) => record.id === recordId && !record.returnedOn) ??
          getActiveLoan(book);

        if (!activeLoan) {
          return book;
        }

        return {
          ...book,
          availableCopies: Math.min(book.copies, (book.availableCopies ?? 0) + 1),
          borrowings: book.borrowings.map((record) =>
            record.id === activeLoan.id ? { ...record, returnedOn: todayIso } : record,
          ),
        };
      }),
    );
  };

  const applyManualFine = (bookId, amount, recordId = null) => {
    const normalizedAmount = Number(amount);
    const nextAmount = Number.isNaN(normalizedAmount) ? 0 : normalizedAmount;

    setBooks((currentBooks) =>
      currentBooks.map((book) => {
        if (book.id !== bookId) {
          return book;
        }

        const targetRecordId = recordId ?? getActiveLoan(book)?.id;

        if (!targetRecordId) {
          return book;
        }

        return {
          ...book,
          borrowings: book.borrowings.map((record) =>
            record.id === targetRecordId
              ? { ...record, manualFine: nextAmount, fineCleared: nextAmount > 0 ? false : record.fineCleared }
              : record,
          ),
        };
      }),
    );
  };

  const issueBookToStudent = ({ bookId, userEmail, dueDate }) => {
    const issueDate = getLocalIsoDate();
    const account = accounts.find((item) => item.email === userEmail);

    if (!account || !dueDate) {
      return { ok: false };
    }

    let didIssue = false;

    setBooks((currentBooks) =>
      currentBooks.map((book) => {
        if (book.id !== bookId || book.availableCopies <= 0) {
          return book;
        }

        didIssue = true;

        return {
          ...book,
          availableCopies: Math.max(0, book.availableCopies - 1),
          borrowings: [
            ...book.borrowings,
            {
              id: `loan-${book.bookCode}-${Date.now()}`,
              userEmail: account.email,
              userName: account.name,
              issuedOn: issueDate,
              dueDate,
              returnedOn: null,
              finePerDay: fineSettings.amount,
              fineRate: fineSettings.amount,
              fineInterval: fineSettings.interval,
              manualFine: 0,
              fineCleared: false,
            },
          ],
        };
      }),
    );

    return { ok: didIssue };
  };

  const issueManualBooksToStudent = async ({ userEmail, studentDetails, books: manualBooks }) => {
    try {
      const response = await fetch(`${API_BOOKS_URL}/issue-manual`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          userEmail,
          studentDetails,
          books: manualBooks,
          fineRate: fineSettings.amount,
          fineInterval: fineSettings.interval,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchManualIssues();
        return { ok: true, count: data.count };
      }
      return { ok: false, error: data.message || "خطا در امانت دستی کتاب‌ها" };
    } catch (error) {
      console.error("خطا در امانت دستی کتاب‌ها از سرور:", error);
      return { ok: false, error: "خطای شبکه در امانت دستی کتاب‌ها" };
    }
  };

  const returnIssuedRecord = async ({ source, recordId, bookId = null }) => {
    const todayIso = getLocalIsoDate();
    
    setManualIssues((currentIssues) =>
      currentIssues.map((issue) =>
        issue.id === recordId || issue._id === recordId
          ? { ...issue, returnedOn: todayIso }
          : issue,
      ),
    );

    if (source === "catalog" && bookId) {
      returnBook(bookId, recordId);
    }

    try {
      const response = await fetch(`${API_BOOKS_URL}/issues/${recordId}/return`, {
        method: "PUT",
        headers: getHeaders(),
      });

      if (response.ok) {
        return { ok: true };
      } else {
        await fetchManualIssues();
        return { ok: false };
      }
    } catch (error) {
      console.error("خطا در بازگشت کتاب از سرور:", error);
      await fetchManualIssues();
      return { ok: false };
    }
  };

  const applyFineToRecord = async ({ source, recordId, bookId = null, amount }) => {
    const normalizedAmount = Number(amount);
    const fineAmount = Number.isNaN(normalizedAmount) ? 0 : normalizedAmount;

    try {
      const response = await fetch(`${API_BOOKS_URL}/issues/${recordId}/fine`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ amount: fineAmount }),
      });

      if (response.ok) {
        if (source === "catalog" && bookId) {
          applyManualFine(bookId, fineAmount, recordId);
        }
        await fetchManualIssues();
        return { ok: true };
      }
    } catch (error) {
      console.error("خطا در اعمال جریمه دستی از سرور:", error);
    }
  };

  const clearFineForRecord = async ({ source, recordId, bookId = null }) => {
    const fineAmount = 0;
    
    setManualIssues((currentIssues) =>
      currentIssues.map((issue) =>
        issue.id === recordId || issue._id === recordId
          ? {
              ...issue,
              manualFine: fineAmount,
              fineCleared: true,
              clearedFineAmount: getFineAmount(issue, fineSettings),
            }
          : issue,
      ),
    );

    if (source === "catalog" && bookId) {
      setBooks((currentBooks) =>
        currentBooks.map((book) => {
          if (book.id !== bookId) {
            return book;
          }

          return {
            ...book,
            borrowings: book.borrowings.map((record) =>
              record.id === recordId
                ? {
                    ...record,
                    manualFine: fineAmount,
                    fineCleared: true,
                    clearedFineAmount: getFineAmount(record, fineSettings),
                  }
                : record,
            ),
          };
        }),
      );
    }

    try {
      const response = await fetch(`${API_BOOKS_URL}/issues/${recordId}/clear-fine`, {
        method: "PUT",
        headers: getHeaders(),
      });

      if (response.ok) {
        return { ok: true };
      } else {
        await fetchManualIssues();
        return { ok: false };
      }
    } catch (error) {
      console.error("خطا در پاک کردن جریمه دستی از سرور:", error);
      await fetchManualIssues();
      return { ok: false };
    }
  };

  const saveFineSettings = async ({ amount, interval }) => {
    const updatedSettings = hydrateFineSettings({ amount, interval });
    setFineSettings(updatedSettings);
    localStorage.setItem(LIBRARY_FINE_SETTINGS_KEY, JSON.stringify(updatedSettings));

    try {
      const response = await fetch(`${API_BOOKS_URL}/fine-settings`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ amount, interval }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          setFineSettings(hydrateFineSettings(data.settings));
        }
      }
    } catch (error) {
      console.error("خطا در ذخیره تنظیمات جریمه در سرور:", error);
    }
  };

  const bookViews = books.map((book) => getBookView(book, fineSettings));
  const activeBooks = bookViews.filter((book) => book.activeLoan);
  const overdueBooks = activeBooks.filter((book) => book.status === "دیرکرد");

  const studentAccounts = accounts.filter((account) => account.role === "user");

  const allRecords = manualIssues.map((issue) => createManualRecord(issue, fineSettings));

  const studentSummaries = studentAccounts.map((account) => {
    const records = allRecords
      .filter((record) => record.userEmail === account.email)
      .sort((a, b) => new Date(b.issuedOn).getTime() - new Date(a.issuedOn).getTime());

    const activeRecords = records.filter((record) => !record.returnedOn);
    const overdueRecords = activeRecords.filter((record) => record.liveStatus === "دیرکرد");

    return {
      ...account,
      borrowedCount: activeRecords.length,
      totalIssued: records.length,
      totalFine: activeRecords.reduce((sum, record) => sum + record.liveFine, 0),
      totalClearedFine: records.reduce(
        (sum, record) => sum + (Number(record.clearedFineAmount ?? 0) || 0),
        0,
      ),
      fineClearedCount: activeRecords.filter((record) => record.fineCleared).length,
      status: overdueRecords.length ? "دیرکرد" : activeRecords.length ? "امانت‌گیرنده" : "پاک",
      activeBooks: activeRecords,
      history: records,
    };
  });

  const currentUserSummary = currentUser
    ? studentSummaries.find((student) => student.email === currentUser.email) ?? (() => {
        const records = allRecords
          .filter((record) => record.userEmail === currentUser.email)
          .sort((a, b) => new Date(b.issuedOn).getTime() - new Date(a.issuedOn).getTime());

        const activeRecords = records.filter((record) => !record.returnedOn);
        const overdueRecords = activeRecords.filter((record) => record.liveStatus === "دیرکرد");

        return {
          ...currentUser,
          borrowedCount: activeRecords.length,
          totalIssued: records.length,
          totalFine: activeRecords.reduce((sum, record) => sum + record.liveFine, 0),
          totalClearedFine: records.reduce(
            (sum, record) => sum + (Number(record.clearedFineAmount ?? 0) || 0),
            0,
          ),
          fineClearedCount: activeRecords.filter((record) => record.fineCleared).length,
          status: overdueRecords.length ? "دیرکرد" : activeRecords.length ? "امانت‌گیرنده" : "پاک",
          activeBooks: activeRecords,
          history: records,
        };
      })()
    : null;

  const currentUserHistory = currentUserSummary?.history ?? [];
  const totalClearedFine = studentSummaries.reduce(
    (sum, student) => sum + (student.totalClearedFine ?? 0),
    0,
  );

  const activeRecords = allRecords.filter((record) => !record.returnedOn);
  const overdueRecords = allRecords.filter((record) => record.liveStatus === "دیرکرد");

  // ⬅️ آمار با اعداد فارسی
  const adminStats = [
    {
      label: "کل امانت‌ها",
      value: toPersianNumber(allRecords.length),
      note: "همه سوابق امانت دستی کتاب",
      isCurrency: false,
    },
    {
      label: "امانت‌های جاری",
      value: toPersianNumber(activeRecords.length),
      note: "کتاب‌هایی که در حال حاضر در دست دانشجویان است",
      isCurrency: false,
    },
    {
      label: "کتاب‌های دیرکرد",
      value: toPersianNumber(overdueRecords.length),
      note: "وضعیت به‌صورت خودکار پس از تاریخ سررسید تغییر می‌کند",
      isCurrency: false,
    },
    {
      label: "جریمه‌های پرداخت‌شده",
      value: totalClearedFine,
      note: "مبلغ جریمه‌ای که توسط دانشجویان پرداخت شده",
      isCurrency: true,
    },
  ];

  const value = {
    books: bookViews,
    adminStats,
    studentSummaries,
    currentUserSummary,
    currentUserHistory,
    fineSettings,
    returnIssuedRecord,
    applyFineToRecord,
    clearFineForRecord,
    issueBookToStudent,
    issueManualBooksToStudent,
    saveFineSettings,
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);

  if (!context) {
    throw new Error("useLibrary باید داخل LibraryProvider استفاده شود");
  }

  return context;
};