import React, { useState } from "react";
import type { SavingEntry, SavingType } from "../types";
import { useLang } from "./LanguageContext";

interface SavingsFormProps {
  editing: SavingEntry | null;
  onSubmit: (entry: Omit<SavingEntry, "id"> & { id?: string }) => void;
  onCancel: () => void;
}

const today = () => new Date().toISOString().split("T")[0];

export function SavingsForm({ editing, onSubmit, onCancel }: SavingsFormProps) {
  const { t } = useLang();
  const [type, setType] = useState<SavingType>(editing?.type ?? "deposit");
  const [date, setDate] = useState(editing?.date ?? today());
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [description, setDescription] = useState(editing?.description ?? "");

  const handleAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
    const parts = val.split(".");
    if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");
    setAmount(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;
    onSubmit({ id: editing?.id, amount: num, type, date, description });
  };

  return (
    <form onSubmit={handleSubmit} className="transaction-form" noValidate>
      <div className="form-group">
        <label className="form-label">{t.formType}</label>
        <select
          className="form-select"
          value={type}
          onChange={(e) => setType(e.target.value as SavingType)}
        >
          <option value="deposit">{t.savingDeposit}</option>
          <option value="withdraw">{t.savingWithdraw}</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">{t.formDate}</label>
        <input
          className="form-input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">{t.formAmount}</label>
        <input
          className="form-input"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={handleAmount}
          placeholder="0.00"
        />
      </div>
      <div className="form-group">
        <label className="form-label">{t.formDesc}</label>
        <input
          className="form-input"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.descPlaceholder}
          enterKeyHint="done"
        />
      </div>
      <div className="form-actions">
        <button type="submit" className={editing ? "btn-save" : "btn-add"}>
          {editing ? t.btnSave : t.btnAdd}
        </button>
        {editing && (
          <button type="button" className="btn-cancel" onClick={onCancel}>
            {t.btnCancel}
          </button>
        )}
      </div>
    </form>
  );
}
