import { useLang } from "./LanguageContext";

interface SummaryCardsProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

export function SummaryCards({
  balance,
  totalIncome,
  totalExpense,
}: SummaryCardsProps) {
  const { t } = useLang();

  return (
    <section className="summary-cards">
      <div className="card balance">
        <h3>{t.balance}</h3>
        <p>€{balance.toFixed(2)}</p>
      </div>
      <div className="card income">
        <h3>{t.income}</h3>
        <p>€{totalIncome.toFixed(2)}</p>
      </div>
      <div className="card expense">
        <h3>{t.expense}</h3>
        <p>€{totalExpense.toFixed(2)}</p>
      </div>
    </section>
  );
}
