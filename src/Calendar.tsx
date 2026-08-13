import { useMemo, useState } from "react";
import type { Transaction } from "./types";
import { useLang } from "./LanguageContext";

interface CalendarProps {
  transactions: Transaction[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function Calendar({
  transactions,
  selectedDate,
  onSelectDate,
}: CalendarProps) {
  const { t } = useLang();
  const [viewDate, setViewDate] = useState<Date>(() =>
    selectedDate ? new Date(selectedDate) : new Date(),
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const dayInfo = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    transactions.forEach((tx) => {
      const entry = map.get(tx.date) || { income: 0, expense: 0 };
      entry[tx.type] += tx.amount;
      map.set(tx.date, entry);
    });
    return map;
  }, [transactions]);

  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekday = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const now = new Date();
  const todayKey = toDateKey(now.getFullYear(), now.getMonth(), now.getDate());

  const goPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () => setViewDate(new Date());

  const handleDayClick = (day: number) => {
    const key = toDateKey(year, month, day);
    onSelectDate(selectedDate === key ? null : key);
  };

  return (
    <div className="calendar-panel">
      <div className="calendar-header">
        <button className="cal-nav" onClick={goPrevMonth} type="button">
          ‹
        </button>
        <h3>
          {t.months[month]} {year}
        </h3>
        <button className="cal-nav" onClick={goNextMonth} type="button">
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {t.weekdays.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="cal-cell empty" />;
          }
          const key = toDateKey(year, month, day);
          const info = dayInfo.get(key);
          const isSelected = selectedDate === key;
          const isToday = key === todayKey;

          return (
            <button
              type="button"
              key={key}
              className={`cal-cell ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
              onClick={() => handleDayClick(day)}
            >
              <span className="cal-day-num">{day}</span>
              {info && (
                <span className="cal-dots">
                  {info.income > 0 && <span className="dot dot-income" />}
                  {info.expense > 0 && <span className="dot dot-expense" />}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="calendar-footer">
        {selectedDate ? (
          <button
            type="button"
            className="cal-clear"
            onClick={() => onSelectDate(null)}
          >
            {t.calReset} ({selectedDate})
          </button>
        ) : (
          <button type="button" className="cal-clear" onClick={goToday}>
            {t.calToday}
          </button>
        )}
      </div>
    </div>
  );
}
