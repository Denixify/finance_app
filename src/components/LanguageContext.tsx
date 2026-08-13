/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

type Language = "uk" | "ru";

const translations = {
  uk: {
    title: "📊 Фінанси",
    langToggle: "РУС",

    tabOverview: "Огляд",
    tabCalendar: "Календар",
    tabAnalytics: "Аналіз",
    tabHistory: "Історія",

    balance: "Баланс",
    income: "Доходи 📈",
    expense: "Витрати 📉",

    historyTitle: "Історія операцій",
    filterAll: "Всі",
    filterIncome: "Доходи",
    filterExpense: "Витрати",
    resetDate: "Скинути",
    emptyHistory:
      "Ваша фінансова історія поки що порожня, або вибраний фільтр не дав результатів.",
    emptyHistoryDate:
      "На цю дату записів немає. Натисніть «+» знизу, щоб додати — дата вже підставлена.",
    noRecords: "Немає записів",

    formType: "Тип",
    formDate: "Дата",
    formAmount: "Сума",
    formCategory: "Категорія",
    formDesc: "Опис",
    descPlaceholder: "Опціонально",
    btnSave: "Зберегти",
    btnAdd: "Додати",
    btnCancel: "Скасувати",
    typeExpense: "Витрата",
    typeIncome: "Дохід",

    currentMonth: "поточний",
    emptyAnalytics: "Немає записів за",
    statIncome: "Дохід",
    statExpense: "Витрати",
    statBalance: "Баланс",
    vsPrevMonth: "до мин. міс.",
    newTag: "новий",
    breakdownTitle: "Витрати за категоріями",
    chartDynamics: "Динаміка фінансів",
    chartEmptyLine: "Недостатньо даних для побудови графіка",
    chartStruct: "Структура витрат",
    chartEmptyPie: "Немає витрат для аналізу",

    settingsTitle: "⚙️ Налаштування",
    settingsHint:
      "Дані зберігаються локально в цьому браузері (localStorage). Якщо очистити кеш браузера або перейти з іншого пристрою — записів там не буде. Регулярно робіть резервну копію.",
    btnExport: "⬇️ Експортувати дані (JSON)",
    btnImport: "⬆️ Імпортувати з файлу",
    btnClear: "🗑️ Очистити всі дані",
    settingsMeta: "Записів у базі:",
    alertImport: "Імпортувати записи? Це замінить поточні дані.",
    alertImportError:
      "Не вдалося прочитати файл — перевірте, що це коректний backup.",
    alertClear:
      "Видалити всі записи безповоротно? Рекомендуємо спершу зробити експорт.",
    btnEasterEgg: "🎮 Відпочити",
    btnEasterEggClose: "✕ Закрити",
    msTitle: "💣 Сапер",
    msDig: "⛏️ Відкрити",
    msFlag: "🚩 Прапорець",

    calReset: "Скинути дату",
    calToday: "Сьогодні",
    dayEmpty: "Немає записів на цю дату",
    daySelectPrompt:
      "Оберіть дату в календарі, щоб переглянути або додати запис",

    catExpense: [
      "Продукти",
      "Телефонія",
      "Побут",
      "Розваги",
      "Здоров'я",
      "Кафе та ресторани",
      "Одяг",
      "Інше",
    ],
    catIncome: ["Зарплата", "Подарунок"],
    months: [
      "Січень",
      "Лютий",
      "Березень",
      "Квітень",
      "Травень",
      "Червень",
      "Липень",
      "Серпень",
      "Вересень",
      "Жовтень",
      "Листопад",
      "Грудень",
    ],
    weekdays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
  },
  ru: {
    title: "📊 Финансы",
    langToggle: "УКР",

    tabOverview: "Обзор",
    tabCalendar: "Календарь",
    tabAnalytics: "Анализ",
    tabHistory: "История",

    balance: "Баланс",
    income: "Доходы 📈",
    expense: "Расходы 📉",

    historyTitle: "История операций",
    filterAll: "Все",
    filterIncome: "Доходы",
    filterExpense: "Расходы",
    resetDate: "Сбросить",
    emptyHistory:
      "Ваша финансовая история пока пуста, или выбранный фильтр не дал результатов.",
    emptyHistoryDate:
      "На эту дату записей нет. Нажмите «+» снизу, чтобы добавить — дата уже подставлена.",
    noRecords: "Нет записей",

    formType: "Тип",
    formDate: "Дата",
    formAmount: "Сумма",
    formCategory: "Категория",
    formDesc: "Описание",
    descPlaceholder: "Опционально",
    btnSave: "Сохранить",
    btnAdd: "Добавить",
    btnCancel: "Отменить",
    typeExpense: "Расход",
    typeIncome: "Доход",

    currentMonth: "текущий",
    emptyAnalytics: "Нет записей за",
    statIncome: "Доход",
    statExpense: "Расходы",
    statBalance: "Баланс",
    vsPrevMonth: "к прош. мес.",
    newTag: "новый",
    breakdownTitle: "Расходы по категориям",
    chartDynamics: "Динамика финансов",
    chartEmptyLine: "Недостаточно данных для графика",
    chartStruct: "Структура расходов",
    chartEmptyPie: "Нет расходов для анализа",
    settingsTitle: "⚙️ Настройки",
    settingsHint:
      "Данные хранятся локально в этом браузере (localStorage). Если очистить кэш или зайти с другого устройства — записей не будет. Регулярно делайте бэкап.",
    btnExport: "⬇️ Экспортировать данные (JSON)",
    btnImport: "⬆️ Импортировать из файла",
    btnClear: "🗑️ Очистить все данные",
    settingsMeta: "Записей в базе:",
    alertImport: "Импортировать записи? Это заменит текущие данные.",
    alertImportError:
      "Не удалось прочитать файл — проверьте, что это корректный бэкап.",
    alertClear:
      "Удалить все записи безвозвратно? Рекомендуем сначала сделать экспорт.",
    btnEasterEgg: "🎮 Отдохнуть",
    btnEasterEggClose: "✕ Закрыть",
    msTitle: "💣 Сапер",
    msDig: "⛏️ Открыть",
    msFlag: "🚩 Флажок",

    calReset: "Сбросить дату",
    calToday: "Сегодня",
    dayEmpty: "Нет записей на эту дату",
    daySelectPrompt:
      "Выберите дату в календаре, чтобы посмотреть или добавить запись",

    catExpense: [
      "Продукты",
      "Телефония",
      "Быт",
      "Развлечения",
      "Здоровье",
      "Кафе и рестораны",
      "Одежда",
      "Другое",
    ],
    catIncome: ["Зарплата", "Подарок"],
    months: [
      "Январь",
      "Февраль",
      "Март",
      "Апрель",
      "Май",
      "Июнь",
      "Июль",
      "Август",
      "Сентябрь",
      "Октябрь",
      "Ноябрь",
      "Декабрь",
    ],
    weekdays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  },
};

type Translations = typeof translations.uk;

interface LanguageContextType {
  lang: Language;
  t: Translations;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("finance-app:lang");
    return saved === "ru" || saved === "uk" ? saved : "uk";
  });

  useEffect(() => {
    localStorage.setItem("finance-app:lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => {
    setLang((prev) => (prev === "uk" ? "ru" : "uk"));
  };

  return (
    <LanguageContext.Provider
      value={{ lang, t: translations[lang], toggleLang }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLang must be used within a LanguageProvider");
  return context;
};
