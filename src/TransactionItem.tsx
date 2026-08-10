import type { Transaction } from "./types";

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  isEditing: boolean;
}

export function TransactionItem({
  transaction: t,
  onEdit,
  onDelete,
  isDeleting,
  isEditing,
}: TransactionItemProps) {
  return (
    <div
      className={`transaction-item ${t.type} ${isDeleting ? "dissolving" : ""} ${isEditing ? "editing" : ""}`}
    >
      <div className="tx-info">
        <span className="tx-category">{t.category}</span>
        {t.description && <span className="tx-desc">{t.description}</span>}
        <span className="tx-date">{t.date}</span>
      </div>
      <div className="tx-actions">
        <span className="tx-amount">
          {t.type === "income" ? "+" : "-"}€{t.amount.toFixed(2)}
        </span>
        <button
          onClick={() => onEdit(t)}
          className="btn-edit"
          type="button"
          aria-label="Редагувати"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(t.id)}
          className="btn-delete"
          type="button"
          aria-label="Видалити"
        >
          ❌
        </button>
      </div>
    </div>
  );
}
