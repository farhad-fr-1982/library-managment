import React, { useEffect, useState } from 'react'
import { Pencil, CheckCircle2 } from 'lucide-react';   // ⬅️ اضافه شد
import { adminFinesPageStyles as s } from '../assets/dummyStyles';
import { useLibrary } from '../shared/LibraryContext';

const fineIntervals = [
  { value: "day", label: "روزانه" },
  { value: "week", label: "هفتگی" },
  { value: "month", label: "ماهانه" },
  { value: "year", label: "سالانه" },
];

const AdminFinesPage = () => {
  const { fineSettings, saveFineSettings } = useLibrary();
  const [form, setForm] = useState(fineSettings);
  const [toast, setToast] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setForm(fineSettings);
  }, [fineSettings]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  // برای ویرایش و به‌روزرسانی تنظیمات جریمه
  const handleSubmit = async (event) => {          // ✅ async اضافه شد
    event.preventDefault();
    await saveFineSettings(form);                   // ✅ await اضافه شد
    setIsEditing(false);
    setToast("تنظیمات جریمه با موفقیت ذخیره شد.");
  };

  return (
    <div className={s.pageContainer}>
      {toast && (
        <div className={s.toastWrapper}>
          <div className={s.toastContent}>
            <CheckCircle2 size={18} />
            {toast}
          </div>
        </div>
      )}

      <section className={s.mainSection}>
        <div className={s.headerFlex}>
          <div>
            <h1 className={s.title}>تنظیمات جریمه</h1>
            <p className={s.subtitle}>
              قانون جریمه دیرکرد را اینجا ذخیره کنید. پس از ذخیره، از آیکون ویرایش برای به‌روزرسانی استفاده کنید.
            </p>
          </div>
          {!isEditing && (
            <button type="button" onClick={() => {
              setForm(fineSettings);
              setIsEditing(true);
            }} className={s.editButton}>
              <Pencil size={18} />
            </button>
          )}
        </div>

        <form className={s.formContainer} onSubmit={handleSubmit}>
          <label className={s.label}>
            <span className={s.labelSpan}>مبلغ جریمه</span>
            <input type="number" min="0" value={form.amount}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  amount: event.target.value
                }))
              } disabled={!isEditing} className={s.input}
            />
          </label>

          <label className={s.label}>
            <span className={s.labelSpan}>بازه جریمه</span>
            <select
              value={form.interval}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  interval: event.target.value,
                }))
              } disabled={!isEditing} className={s.select}>
              {fineIntervals.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {isEditing ? (
            <button type="submit" className={s.submitButton}>
              ذخیره قانون جریمه
            </button>
          ) : (
            <div className={s.readOnlyDisplay}>
              {fineSettings.amount} تومان در هر {fineSettings.interval}
            </div>
          )}
        </form>
      </section>
    </div>
  );
}

export default AdminFinesPage