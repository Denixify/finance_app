import type { Transaction } from "./types";
import { TransactionItem } from "./TransactionItem";

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
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filter === "all" || t.type === filter;
    const matchesDate = !selectedDate || t.date === selectedDate;
    return matchesType && matchesDate;
  });

  return (
    <section className="transactions-list-panel">
      <div className="list-header">
        <h2>Історія операцій</h2>
        <div className="filters">
          <button
            onClick={() => setFilter("all")}
            className={filter === "all" ? "active" : ""}
            type="button"
          >
            Всі
          </button>
          <button
            onClick={() => setFilter("income")}
            className={filter === "income" ? "active" : ""}
            type="button"
          >
            Доходи
          </button>
          <button
            onClick={() => setFilter("expense")}
            className={filter === "expense" ? "active" : ""}
            type="button"
          >
            Витрати
          </button>
        </div>
      </div>

      {selectedDate && (
        <div className="date-filter-banner">
          <span>📅 {selectedDate}</span>
          <button onClick={onClearDate} type="button">
            Скинути
          </button>
        </div>
      )}

      <div className="transactions-list">
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>Немає записів</h3>
            <p>
              {selectedDate
                ? "На цю дату записів немає. Натисніть «+» знизу, щоб додати — дата вже підставлена."
                : "Ваша фінансова історія поки що порожня, або вибраний фільтр не дав результатів."}
            </p>
          </div>
        ) : (
          filteredTransactions.map((t) => (
            <TransactionItem
              key={t.id}
              transaction={t}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={deletingIds.includes(t.id)}
              isEditing={editingId === t.id}
            />
          ))
        )}
      </div>
    </section>
  );
}
