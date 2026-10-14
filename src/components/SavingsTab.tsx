import { useMemo } from "react";
import type { SavingEntry } from "../types";
import { useLang } from "./LanguageContext";

interface SavingsTabProps {
  entries: SavingEntry[];
  deletingIds: string[];
  onEdit: (entry: SavingEntry) => void;
  onDelete: (id: string) => void;
}

export function SavingsTab({
  entries,
  deletingIds,
  onEdit,
  onDelete,
}: SavingsTabProps) {
  const { t } = useLang();

  const { deposited, withdrawn } = useMemo(() => {
    let deposited = 0;
    let withdrawn = 0;
    for (const e of entries) {
      if (e.type === "deposit") deposited += e.amount;
      else withdrawn += e.amount;
    }
    return { deposited, withdrawn };
  }, [entries]);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    [entries],
  );

  return (
    <div className="savings-tab">
      <section className="summary-cards">
        <div className="card balance">
          <h3>{t.savingsTotal}</h3>
          <p>€{(deposited - withdrawn).toFixed(2)}</p>
        </div>
        <div className="card income">
          <h3>{t.savingsDeposited}</h3>
          <p>€{deposited.toFixed(2)}</p>
        </div>
        <div className="card expense">
          <h3>{t.savingsWithdrawn}</h3>
          <p>€{withdrawn.toFixed(2)}</p>
        </div>
      </section>

      {sorted.length === 0 ? (
        <p className="day-empty">{t.savingsEmpty}</p>
      ) : (
        <div className="transactions-list">
          {sorted.map((e) => (
            <div
              key={e.id}
              className={`transaction-item ${e.type === "deposit" ? "income" : "expense"} ${deletingIds.includes(e.id) ? "dissolving" : ""}`}
            >
              <div className="tx-info">
                <span className="tx-category">
                  {e.type === "deposit" ? t.savingDeposit : t.savingWithdraw}
                </span>
                {e.description && (
                  <span className="tx-desc">{e.description}</span>
                )}
                <span className="tx-date">{e.date}</span>
              </div>
              <div className="tx-actions">
                <span className="tx-amount">
                  {e.type === "deposit" ? "+" : "-"}€{e.amount.toFixed(2)}
                </span>
                <button
                  type="button"
                  className="btn-edit"
                  onClick={() => onEdit(e)}
                  aria-label="Edit"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  className="btn-delete"
                  onClick={() => onDelete(e.id)}
                  aria-label="Delete"
                >
                  ❌
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
