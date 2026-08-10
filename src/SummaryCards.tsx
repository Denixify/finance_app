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
  return (
    <section className="summary-cards">
      <div className="card balance">
        <h3>Баланс</h3>
        <p>€{balance.toFixed(2)}</p>
      </div>
      <div className="card income">
        <h3>Доходи 📈</h3>
        <p>€{totalIncome.toFixed(2)}</p>
      </div>
      <div className="card expense">
        <h3>Витрати 📉</h3>
        <p>€{totalExpense.toFixed(2)}</p>
      </div>
    </section>
  );
}
