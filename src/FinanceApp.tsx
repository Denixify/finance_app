import { useState, useMemo, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import "./FinanceApp.scss";
import type { Transaction } from "./types";
import { SummaryCards } from "./SummaryCards";
import { ChartsSection, type LineChartItem } from "./ChartsSection";
import { TransactionForm } from "./TransactionForm";
import { TransactionList } from "./TransactionList";
import { TransactionItem } from "./TransactionItem";
import { Calendar } from "./Calendar";
import { TabBar } from "./TabBar";
import type { AppTab } from "./TabBar";
import { BottomSheet } from "./BottomSheet";
import { AnalyticsTab } from "./AnalyticsTab";
import { useLang } from "./LanguageContext";

const STORAGE_KEY = "finance-app:transactions";

function loadStoredTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function FinanceApp() {
  const { t, toggleLang } = useLang();

  const [transactions, setTransactions] = useState<Transaction[]>(
    loadStoredTransactions,
  );
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<AppTab>("overview");
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch {
      //
    }
  }, [transactions]);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const lineChartData = useMemo(() => {
    const grouped = transactions.reduce(
      (acc, t) => {
        if (!acc[t.date]) acc[t.date] = { date: t.date, income: 0, expense: 0 };
        acc[t.date][t.type] += t.amount;
        return acc;
      },
      {} as Record<string, { date: string; income: number; expense: number }>,
    );

    const sorted = Object.values(grouped).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    return sorted.reduce((acc: LineChartItem[], day) => {
      const prevBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
      acc.push({ ...day, balance: prevBalance + day.income - day.expense });
      return acc;
    }, []);
  }, [transactions]);

  const pieChartData = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const grouped = expenses.reduce(
      (acc, t) => {
        const cleanCategory = t.category.trim();
        const normalizedCat =
          cleanCategory.charAt(0).toUpperCase() +
          cleanCategory.slice(1).toLowerCase();
        if (!acc[normalizedCat])
          acc[normalizedCat] = { name: normalizedCat, value: 0 };
        acc[normalizedCat].value += t.amount;
        return acc;
      },
      {} as Record<string, { name: string; value: number }>,
    );
    return Object.values(grouped);
  }, [transactions]);

  const dayTransactions = useMemo(() => {
    if (!selectedDate) return [];
    return transactions.filter((t) => t.date === selectedDate);
  }, [transactions, selectedDate]);

  const openAddForm = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const openEditForm = (t: Transaction) => {
    setEditingTransaction(t);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const handleAddTransaction = (newTxData: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      id:
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Date.now().toString(),
      ...newTxData,
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions(
      transactions.map((t) => (t.id === updatedTx.id ? updatedTx : t)),
    );
  };

  const handleDelete = (id: string) => {
    setDeletingIds((prev) => [...prev, id]);
    setTimeout(() => {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setDeletingIds((prev) => prev.filter((delId) => delId !== id));
      if (editingTransaction?.id === id) closeForm();
    }, 600);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStamp = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `finance-backup-${dateStamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const isTransactionShape = (value: unknown): value is Transaction => {
    if (!value || typeof value !== "object") return false;
    const t = value as Record<string, unknown>;
    return (
      typeof t.id === "string" &&
      typeof t.amount === "number" &&
      (t.type === "income" || t.type === "expense") &&
      typeof t.date === "string" &&
      typeof t.category === "string"
    );
  };

  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed) || !parsed.every(isTransactionShape)) {
          throw new Error("invalid shape");
        }
        const confirmed = window.confirm(t.alertImport);
        if (confirmed) {
          setTransactions(parsed);
          setIsSettingsOpen(false);
        }
      } catch {
        window.alert(t.alertImportError);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    const confirmed = window.confirm(t.alertClear);
    if (confirmed) {
      setTransactions([]);
      setIsSettingsOpen(false);
    }
  };

  return (
    <div className="finance-dashboard">
      <header className="app-topbar">
        <h1>{t.title}</h1>
        <div className="topbar-actions">
          <button
            type="button"
            className="lang-toggle-btn"
            onClick={toggleLang}
            aria-label="Змінити мову / Сменить язык"
          >
            {t.langToggle}
          </button>
          <button
            type="button"
            className="settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            aria-label={t.settingsTitle}
          >
            ⚙️
          </button>
        </div>
      </header>

      <main className="app-content">
        {activeTab === "overview" && (
          <>
            <SummaryCards
              balance={balance}
              totalIncome={totalIncome}
              totalExpense={totalExpense}
            />
            <ChartsSection
              lineChartData={lineChartData}
              pieChartData={pieChartData}
            />
          </>
        )}

        {activeTab === "calendar" && (
          <div className="calendar-tab">
            <Calendar
              transactions={transactions}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
            <div className="calendar-day-detail">
              {selectedDate ? (
                <>
                  <div className="day-detail-header">
                    <h3>{selectedDate}</h3>
                    <button
                      type="button"
                      className="btn-add-mini"
                      onClick={openAddForm}
                    >
                      + {t.btnAdd}
                    </button>
                  </div>
                  {dayTransactions.length === 0 ? (
                    <p className="day-empty">{t.dayEmpty}</p>
                  ) : (
                    <div className="transactions-list">
                      {dayTransactions.map((t) => (
                        <TransactionItem
                          key={t.id}
                          transaction={t}
                          onEdit={openEditForm}
                          onDelete={handleDelete}
                          isDeleting={deletingIds.includes(t.id)}
                          isEditing={editingTransaction?.id === t.id}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="day-empty">{t.daySelectPrompt}</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <AnalyticsTab transactions={transactions} />
        )}

        {activeTab === "history" && (
          <TransactionList
            transactions={transactions}
            filter={filter}
            setFilter={setFilter}
            onDelete={handleDelete}
            onEdit={openEditForm}
            deletingIds={deletingIds}
            editingId={editingTransaction?.id || null}
            selectedDate={selectedDate}
            onClearDate={() => setSelectedDate(null)}
          />
        )}
      </main>

      <TabBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onAddClick={openAddForm}
      />

      <BottomSheet
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingTransaction ? "✏️" : "+"}
      >
        <TransactionForm
          onAdd={handleAddTransaction}
          onUpdate={handleUpdateTransaction}
          editingTransaction={editingTransaction}
          onCancelEdit={closeForm}
          onUpdated={closeForm}
          defaultDate={selectedDate}
        />
      </BottomSheet>

      <BottomSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title={t.settingsTitle}
      >
        <div className="settings-sheet">
          <p className="settings-hint">{t.settingsHint}</p>
          <button type="button" className="btn-export" onClick={handleExport}>
            {t.btnExport}
          </button>
          <button
            type="button"
            className="btn-import"
            onClick={handleImportClick}
          >
            {t.btnImport}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            style={{ display: "none" }}
          />
          <button type="button" className="btn-danger" onClick={handleClearAll}>
            {t.btnClear}
          </button>
          <p className="settings-meta">
            {t.settingsMeta} {transactions.length}
          </p>
        </div>
      </BottomSheet>
    </div>
  );
}
