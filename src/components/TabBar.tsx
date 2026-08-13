import { useLang } from "./LanguageContext";
export type AppTab = "overview" | "calendar" | "analytics" | "history";

interface TabBarProps {
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
  onAddClick: () => void;
}

export function TabBar({ activeTab, onChangeTab, onAddClick }: TabBarProps) {
  const { t } = useLang();

  return (
    <nav className="tab-bar">
      <button
        type="button"
        className={`tab-item ${activeTab === "overview" ? "active" : ""}`}
        onClick={() => onChangeTab("overview")}
      >
        <span className="tab-icon">🏠</span>
        <span>{t.tabOverview}</span>
      </button>

      <button
        type="button"
        className={`tab-item ${activeTab === "calendar" ? "active" : ""}`}
        onClick={() => onChangeTab("calendar")}
      >
        <span className="tab-icon">📅</span>
        <span>{t.tabCalendar}</span>
      </button>

      <div className="tab-center-slot">
        <button type="button" className="tab-add-button" onClick={onAddClick}>
          +
        </button>
      </div>

      <button
        type="button"
        className={`tab-item ${activeTab === "analytics" ? "active" : ""}`}
        onClick={() => onChangeTab("analytics")}
      >
        <span className="tab-icon">📊</span>
        <span>{t.tabAnalytics}</span>
      </button>

      <button
        type="button"
        className={`tab-item ${activeTab === "history" ? "active" : ""}`}
        onClick={() => onChangeTab("history")}
      >
        <span className="tab-icon">🧾</span>
        <span>{t.tabHistory}</span>
      </button>
    </nav>
  );
}
