import React, { useState, useEffect } from "react";
import type { Transaction, TransactionType } from "../types";
import { useLang } from "./LanguageContext";

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, "id">) => void;
  onUpdate: (transaction: Transaction) => void;
  editingTransaction: Transaction | null;
  onCancelEdit: () => void;
  defaultDate?: string | null;
  onUpdated?: () => void;
}

export function TransactionForm({
  onAdd,
  onUpdate,
  editingTransaction,
  onCancelEdit,
  defaultDate,
  onUpdated,
}: TransactionFormProps) {
  const { t } = useLang();

  const [formData, setFormData] = useState({
    amount: "",
    category: t.catExpense[0],
    type: "expense" as TransactionType,
    date: defaultDate || new Date().toISOString().split("T")[0],
    description: "",
  });

  useEffect(() => {
    if (editingTransaction) {
      // eslint-disable-next-line
      setFormData({
        amount: editingTransaction.amount.toString(),
        category: editingTransaction.category,
        type: editingTransaction.type,
        date: editingTransaction.date,
        description: editingTransaction.description || "",
      });
    } else {
      setFormData({
        amount: "",
        category: t.catExpense[0],
        type: "expense",
        date: defaultDate || new Date().toISOString().split("T")[0],
        description: "",
      });
    }
  }, [editingTransaction, defaultDate, t.catExpense]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "type") {
      const newCategory =
        value === "expense" ? t.catExpense[0] : t.catIncome[0];
      setFormData({
        ...formData,
        type: value as TransactionType,
        category: newCategory,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    if (editingTransaction) {
      onUpdate({
        ...editingTransaction,
        amount: amountNum,
        category: formData.category,
        type: formData.type,
        date: formData.date,
        description: formData.description,
      });
      onUpdated?.();
      return;
    }

    onAdd({
      amount: amountNum,
      category: formData.category,
      type: formData.type,
      date: formData.date,
      description: formData.description,
    });

    setFormData({
      ...formData,
      amount: "",
      category: formData.type === "expense" ? t.catExpense[0] : t.catIncome[0],
      description: "",
    });

    onUpdated?.();
  };

  const currentCategories =
    formData.type === "expense" ? t.catExpense : t.catIncome;

  return (
    <form onSubmit={handleSubmit} className="transaction-form" noValidate>
      <div className="form-group">
        <label className="form-label">{t.formType}</label>
        <select
          className="form-select"
          name="type"
          value={formData.type}
          onChange={handleInputChange}
        >
          <option value="expense">{t.typeExpense}</option>
          <option value="income">{t.typeIncome}</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">{t.formDate}</label>
        <input
          className="form-input"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t.formAmount}</label>
        <input
          className="form-input"
          type="number"
          inputMode="decimal"
          step="0.01"
          name="amount"
          value={formData.amount}
          onChange={handleInputChange}
          placeholder="0.00"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t.formCategory}</label>
        <select
          className="form-select"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          required
        >
          {currentCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
          {!currentCategories.includes(formData.category) &&
            formData.category && (
              <option value={formData.category}>{formData.category}</option>
            )}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">{t.formDesc}</label>
        <input
          className="form-input"
          type="text"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder={t.descPlaceholder}
          enterKeyHint="done"
        />
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className={editingTransaction ? "btn-save" : "btn-add"}
        >
          {editingTransaction ? t.btnSave : t.btnAdd}
        </button>
        {editingTransaction && (
          <button type="button" className="btn-cancel" onClick={onCancelEdit}>
            {t.btnCancel}
          </button>
        )}
      </div>
    </form>
  );
}
