export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string;
  description: string;
}

export type SavingType = "deposit" | "withdraw";

export interface SavingEntry {
  id: string;
  amount: number;
  type: SavingType;
  date: string;
  description: string;
}
