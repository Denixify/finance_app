export type AppTab = "overview" | "calendar" | "analytics" | "history";

interface TabBarProps {
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
  onAddClick: () => void;
}

export function TabBar({ activeTab, onChangeTab, onAddClick }: TabBarProps) {
  return (
    <nav className="tab-bar">
      <button
        type="button"
        className={`tab-item ${activeTab === "overview" ? "active" : ""}`}
        onClick={() => onChangeTab("overview")}
      >
        <span className="tab-icon">🏠</span>
        <span>Огляд</span>
      </button>

      <button
        type="button"
        className={`tab-item ${activeTab === "calendar" ? "active" : ""}`}
        onClick={() => onChangeTab("calendar")}
      >
        <span className="tab-icon">📅</span>
        <span>Календар</span>
      </button>

      <div className="tab-center-slot">
        <button
          type="button"
          className="tab-add-button"
          onClick={onAddClick}
          aria-label="Додати запис"
        >
          +
        </button>
      </div>

      <button
        type="button"
        className={`tab-item ${activeTab === "analytics" ? "active" : ""}`}
        onClick={() => onChangeTab("analytics")}
      >
        <span className="tab-icon">📊</span>
        <span>Аналіз</span>
      </button>

      <button
        type="button"
        className={`tab-item ${activeTab === "history" ? "active" : ""}`}
        onClick={() => onChangeTab("history")}
      >
        <span className="tab-icon">🧾</span>
        <span>Історія</span>
      </button>
    </nav>
  );
}
