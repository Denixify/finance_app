import type { Transaction } from "./types";
import { TransactionItem } from "./TransactionItem";
import { useLang } from "./LanguageContext";

interface TransactionListProps {
  transactions: Transaction[];
  filter: "all" | "income" | "expense";
  setFilter: (filter: "all" | "income" | "expense") => void;
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  deletingIds: string[];
  editingId: string | null;
  selectedDate: string | null;
  onClearDate: () => void;
}

export function TransactionList({
  transactions,
  filter,
  setFilter,
  onDelete,
  onEdit,
  deletingIds,
  editingId,
  selectedDate,
  onClearDate,
}: TransactionListProps) {
  const { t } = useLang();

  const filteredTransactions = transactions.filter((tx) => {
    const matchesType = filter === "all" || tx.type === filter;
    const matchesDate = !selectedDate || tx.date === selectedDate;
    return matchesType && matchesDate;
  });

  return (
    <section className="transactions-list-panel">
      <div className="list-header">
        <h2>{t.historyTitle}</h2>
        <div className="filters">
          <button
            onClick={() => setFilter("all")}
            className={filter === "all" ? "active" : ""}
            type="button"
          >
            {t.filterAll}
          </button>
          <button
            onClick={() => setFilter("income")}
            className={filter === "income" ? "active" : ""}
            type="button"
          >
            {t.filterIncome}
          </button>
          <button
            onClick={() => setFilter("expense")}
            className={filter === "expense" ? "active" : ""}
            type="button"
          >
            {t.filterExpense}
          </button>
        </div>
      </div>

      {selectedDate && (
        <div className="date-filter-banner">
          <span>📅 {selectedDate}</span>
          <button onClick={onClearDate} type="button">
            {t.resetDate}
          </button>
        </div>
      )}

      <div className="transactions-list">
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>{t.noRecords}</h3>
            <p>{selectedDate ? t.emptyHistoryDate : t.emptyHistory}</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={deletingIds.includes(tx.id)}
              isEditing={editingId === tx.id}
            />
          ))
        )}
      </div>
    </section>
  );
}
