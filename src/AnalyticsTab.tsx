import { useMemo, useState } from "react";
import type { Transaction } from "./types";
import { ChartsSection } from "./ChartsSection";
import type { LineChartItem, PieChartItem } from "./ChartsSection";
import { monthKey } from "./dateUtils";
import { useLang } from "./LanguageContext";

interface AnalyticsTabProps {
  transactions: Transaction[];
}

const CATEGORY_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#F7DC6F",
  "#9B59B6",
  "#E67E22",
];

function sumByType(list: Transaction[], type: Transaction["type"]): number {
  return list
    .filter((t) => t.type === type)
    .reduce((acc, t) => acc + t.amount, 0);
}

function calcDelta(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function DeltaBadge({
  delta,
  positiveIsGood,
}: {
  delta: number | null;
  positiveIsGood: boolean;
}) {
  const { t } = useLang();
  if (delta === null)
    return <span className="delta-badge neutral">{t.newTag}</span>;
  const isGood = positiveIsGood ? delta >= 0 : delta <= 0;
  const arrow = delta > 0 ? "▲" : delta < 0 ? "▼" : "•";
  return (
    <span className={`delta-badge ${isGood ? "good" : "bad"}`}>
      {arrow} {Math.abs(delta)}% {t.vsPrevMonth}
    </span>
  );
}

export function AnalyticsTab({ transactions }: AnalyticsTabProps) {
  const { t } = useLang();
  const [viewDate, setViewDate] = useState(() => new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const currentKey = monthKey(year, month);

  const prevViewDate = new Date(year, month - 1, 1);
  const prevKey = monthKey(prevViewDate.getFullYear(), prevViewDate.getMonth());

  const goPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const monthTransactions = useMemo(
    () => transactions.filter((tx) => tx.date.startsWith(currentKey)),
    [transactions, currentKey],
  );
  const prevMonthTransactions = useMemo(
    () => transactions.filter((tx) => tx.date.startsWith(prevKey)),
    [transactions, prevKey],
  );

  const income = sumByType(monthTransactions, "income");
  const expense = sumByType(monthTransactions, "expense");
  const balance = income - expense;

  const incomeDelta = calcDelta(
    income,
    sumByType(prevMonthTransactions, "income"),
  );
  const expenseDelta = calcDelta(
    expense,
    sumByType(prevMonthTransactions, "expense"),
  );

  const lineChartData = useMemo(() => {
    const priorTransactions = transactions.filter((tx) => tx.date < currentKey);
    const startingBalance = priorTransactions.reduce(
      (sum, tx) => sum + (tx.type === "income" ? tx.amount : -tx.amount),
      0,
    );

    const grouped = monthTransactions.reduce(
      (acc, tx) => {
        if (!acc[tx.date])
          acc[tx.date] = { date: tx.date, income: 0, expense: 0 };
        acc[tx.date][tx.type] += tx.amount;
        return acc;
      },
      {} as Record<string, { date: string; income: number; expense: number }>,
    );

    const sorted = Object.values(grouped).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    return sorted.reduce((acc: LineChartItem[], day) => {
      const prevBalance =
        acc.length > 0 ? acc[acc.length - 1].balance : startingBalance;
      acc.push({ ...day, balance: prevBalance + day.income - day.expense });
      return acc;
    }, []);
  }, [monthTransactions, transactions, currentKey]);

  const categoryBreakdown = useMemo(() => {
    const expenses = monthTransactions.filter((tx) => tx.type === "expense");
    const grouped = expenses.reduce(
      (acc, tx) => {
        const cleanCategory = tx.category.trim();
        const normalizedCat =
          cleanCategory.charAt(0).toUpperCase() +
          cleanCategory.slice(1).toLowerCase();
        if (!acc[normalizedCat])
          acc[normalizedCat] = { name: normalizedCat, value: 0 };
        acc[normalizedCat].value += tx.amount;
        return acc;
      },
      {} as Record<string, PieChartItem>,
    );

    const list = Object.values(grouped).sort((a, b) => b.value - a.value);
    const total = list.reduce((acc, c) => acc + c.value, 0);
    return list.map((c) => ({
      ...c,
      percent: total > 0 ? Math.round((c.value / total) * 100) : 0,
    }));
  }, [monthTransactions]);

  const pieChartData: PieChartItem[] = categoryBreakdown.map(
    ({ name, value }) => ({ name, value }),
  );

  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  return (
    <div className="analytics-tab">
      <div className="month-switcher">
        <button type="button" className="cal-nav" onClick={goPrevMonth}>
          ‹
        </button>
        <h3>
          {t.months[month]} {year}
          {isCurrentMonth && (
            <span className="current-month-badge">{t.currentMonth}</span>
          )}
        </h3>
        <button type="button" className="cal-nav" onClick={goNextMonth}>
          ›
        </button>
      </div>

      {monthTransactions.length === 0 ? (
        <div className="chart-empty-state">
          <span className="empty-chart-icon">🗓️</span>
          <p>
            {t.emptyAnalytics} {t.months[month].toLowerCase()} {year}
          </p>
        </div>
      ) : (
        <>
          <div className="month-stats">
            <div className="month-stat income">
              <span className="stat-label">{t.statIncome}</span>
              <span className="stat-value">€{income.toFixed(2)}</span>
              <DeltaBadge delta={incomeDelta} positiveIsGood />
            </div>
            <div className="month-stat expense">
              <span className="stat-label">{t.statExpense}</span>
              <span className="stat-value">€{expense.toFixed(2)}</span>
              <DeltaBadge delta={expenseDelta} positiveIsGood={false} />
            </div>
            <div className="month-stat balance">
              <span className="stat-label">{t.statBalance}</span>
              <span
                className={`stat-value ${balance >= 0 ? "positive" : "negative"}`}
              >
                {balance >= 0 ? "+" : ""}€{balance.toFixed(2)}
              </span>
            </div>
          </div>

          {categoryBreakdown.length > 0 && (
            <div className="category-breakdown">
              <h3>{t.breakdownTitle}</h3>
              <div className="category-bars">
                {categoryBreakdown.map((c, i) => (
                  <div className="category-bar-row" key={c.name}>
                    <div className="category-bar-label">
                      <span>{c.name}</span>
                      <span>
                        €{c.value.toFixed(2)} · {c.percent}%
                      </span>
                    </div>
                    <div className="category-bar-track">
                      <div
                        className="category-bar-fill"
                        style={{
                          width: `${c.percent}%`,
                          backgroundColor:
                            CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <ChartsSection
            lineChartData={lineChartData}
            pieChartData={pieChartData}
          />
        </>
      )}
    </div>
  );
}
