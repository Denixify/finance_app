import { useState, useMemo, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import "./FinanceApp.scss";
import type { Transaction } from "./types";
import { SummaryCards } from "./components/SummaryCards";
import { ChartsSection, type LineChartItem } from "./components/ChartsSection";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";
import { TransactionItem } from "./components/TransactionItem";
import { Calendar } from "./components/Calendar";
import { TabBar } from "./components/TabBar";
import type { AppTab } from "./components/TabBar";
import { BottomSheet } from "./components/BottomSheet";
import { AnalyticsTab } from "./components/AnalyticsTab";
import { useLang } from "./components/LanguageContext";
import { MinesweeperApp } from "./EasterEgg/MinesweeperApp";
import { LoginScreen } from "./components/LoginScreen";

import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { encryptData, decryptData } from "./cryptoUtils";

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

  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState<string | null>(
    localStorage.getItem("finance-app:nickname"),
  );
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

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
  const [isMinesweeperOpen, setIsMinesweeperOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        if (
          !localStorage.getItem("finance-app:nickname") &&
          currentUser.email
        ) {
          const extracted = currentUser.email.split("@")[0];
          const capitalized =
            extracted.charAt(0).toUpperCase() + extracted.slice(1);
          setNickname(capitalized);
          localStorage.setItem("finance-app:nickname", capitalized);
        }

        setIsSyncing(true);
        try {
          const notesRef = collection(db, "users", currentUser.uid, "notes");
          const snapshot = await getDocs(notesRef);

          if (!snapshot.empty) {
            const firebaseTransactions: Transaction[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              if (data.encryptedPayload) {
                const decrypted = decryptData(data.encryptedPayload);
                if (decrypted) {
                  firebaseTransactions.push({
                    id: docSnap.id,
                    ...decrypted,
                  } as Transaction);
                }
              } else {
                firebaseTransactions.push({
                  id: docSnap.id,
                  ...data,
                } as Transaction);
              }
            });

            firebaseTransactions.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            );
            setTransactions(firebaseTransactions);
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(firebaseTransactions),
            );
          } else {
            const localData = loadStoredTransactions();
            if (localData.length > 0) {
              const batch = writeBatch(db);
              localData.forEach((tx) => {
                const docRef = doc(
                  db,
                  "users",
                  currentUser.uid,
                  "notes",
                  tx.id,
                );
                batch.set(docRef, { encryptedPayload: encryptData(tx) });
              });
              await batch.commit();
              setTransactions(localData);
            }
          }
        } catch (error) {
          console.error("Fetch error:", error);
        } finally {
          setIsSyncing(false);
        }
      } else {
        setTransactions([]);
      }
      setIsAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isMinesweeperOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
  }, [isMinesweeperOpen]);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const lineChartData = useMemo(() => {
    const grouped = transactions.reduce(
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
      const prevBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
      acc.push({ ...day, balance: prevBalance + day.income - day.expense });
      return acc;
    }, []);
  }, [transactions]);

  const pieChartData = useMemo(() => {
    const expenses = transactions.filter((tx) => tx.type === "expense");
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
      {} as Record<string, { name: string; value: number }>,
    );
    return Object.values(grouped);
  }, [transactions]);

  const dayTransactions = useMemo(() => {
    if (!selectedDate) return [];
    return transactions.filter((tx) => tx.date === selectedDate);
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

  const handleAddTransaction = async (newTxData: Omit<Transaction, "id">) => {
    if (!user) return;
    const newTransaction: Transaction = {
      id:
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Date.now().toString(),
      ...newTxData,
    };

    const updatedList = [newTransaction, ...transactions];
    setTransactions(updatedList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    try {
      const payload = encryptData(newTransaction);
      await setDoc(doc(db, "users", user.uid, "notes", newTransaction.id), {
        encryptedPayload: payload,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTransaction = async (updatedTx: Transaction) => {
    if (!user) return;
    const updatedList = transactions.map((t) =>
      t.id === updatedTx.id ? updatedTx : t,
    );
    setTransactions(updatedList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    try {
      const payload = encryptData(updatedTx);
      await setDoc(doc(db, "users", user.uid, "notes", updatedTx.id), {
        encryptedPayload: payload,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    setDeletingIds((prev) => [...prev, id]);
    setTimeout(async () => {
      const updatedList = transactions.filter((t) => t.id !== id);
      setTransactions(updatedList);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      setDeletingIds((prev) => prev.filter((delId) => delId !== id));
      if (editingTransaction?.id === id) closeForm();

      try {
        await deleteDoc(doc(db, "users", user.uid, "notes", id));
      } catch (e) {
        console.error(e);
      }
    }, 600);
  };

  const handleLogout = async () => {
    if (window.confirm(t.logoutConfirm)) {
      await signOut(auth);
      setNickname(null);
      localStorage.removeItem("finance-app:nickname");

      setTransactions([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();
  const handleImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed) || !parsed.every(isTransactionShape))
          throw new Error("invalid shape");
        if (window.confirm(t.alertImport)) {
          setTransactions(parsed);
          setIsSettingsOpen(false);
          const batch = writeBatch(db);
          parsed.forEach((tx) => {
            const docRef = doc(db, "users", user.uid, "notes", tx.id);
            batch.set(docRef, { encryptedPayload: encryptData(tx) });
          });
          await batch.commit();
        }
      } catch {
        window.alert(t.alertImportError);
      }
    };
    reader.readAsText(file);
  };

  const isTransactionShape = (value: unknown): value is Transaction => {
    if (!value || typeof value !== "object") return false;
    const tx = value as Record<string, unknown>;
    return (
      typeof tx.id === "string" &&
      typeof tx.amount === "number" &&
      (tx.type === "income" || tx.type === "expense") &&
      typeof tx.date === "string" &&
      typeof tx.category === "string"
    );
  };

  const handleClearAll = async () => {
    if (!user) return;
    if (window.confirm(t.alertClear)) {
      setTransactions([]);
      setIsSettingsOpen(false);
      localStorage.removeItem(STORAGE_KEY);

      try {
        const notesRef = collection(db, "users", user.uid, "notes");
        const snapshot = await getDocs(notesRef);
        const batch = writeBatch(db);
        snapshot.forEach((document) => {
          batch.delete(doc(db, "users", user.uid, "notes", document.id));
        });
        await batch.commit();
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (isAuthChecking) {
    return (
      <div className="finance-dashboard loading-screen">
        <div className="loading-text">{t.loginLoading}</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLoginSuccess={setNickname} />;
  }

  return (
    <div className="finance-dashboard">
      <header className="app-topbar">
        <h1>{t.title}</h1>
        <div className="topbar-actions">
          <button
            type="button"
            className="lang-toggle-btn"
            onClick={toggleLang}
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

          <button
            type="button"
            className="settings-btn logout-btn"
            onClick={handleLogout}
            title={t.logoutBtnTitle}
          >
            🚪
          </button>
        </div>
      </header>

      {isSyncing && <div className="sync-indicator">{t.syncing}</div>}

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
                      {dayTransactions.map((tx) => (
                        <TransactionItem
                          key={tx.id}
                          transaction={tx}
                          onEdit={openEditForm}
                          onDelete={handleDelete}
                          isDeleting={deletingIds.includes(tx.id)}
                          isEditing={editingTransaction?.id === tx.id}
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
        title={editingTransaction ? t.formTitleEdit : t.formTitleAdd}
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
          <p className="settings-user-info">
            {t.userPrefix} {nickname || "Анонім"}
          </p>
          <p className="settings-hint-center">{t.settingsHint}</p>

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
            className="hidden-input"
          />
          <button type="button" className="btn-danger" onClick={handleClearAll}>
            {t.btnClear}
          </button>

          <button
            type="button"
            className="btn-easter-egg"
            onClick={() => {
              setIsSettingsOpen(false);
              setTimeout(() => setIsMinesweeperOpen(true), 300);
            }}
          >
            {t.btnEasterEgg}
          </button>

          <p className="settings-meta">
            {t.settingsMeta} {transactions.length}
          </p>
        </div>
      </BottomSheet>

      {isMinesweeperOpen && (
        <div className="minesweeper-overlay">
          <button
            type="button"
            className="minesweeper-close"
            onClick={() => setIsMinesweeperOpen(false)}
          >
            {t.btnEasterEggClose}
          </button>
          <MinesweeperApp />
        </div>
      )}
    </div>
  );
}
