import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useLang } from "./LanguageContext";

export interface LineChartItem {
  date: string;
  income: number;
  expense: number;
  balance: number;
}
export interface PieChartItem {
  name: string;
  value: number;
}

interface ChartsSectionProps {
  lineChartData: LineChartItem[];
  pieChartData: PieChartItem[];
}

const PIE_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#F7DC6F",
  "#9B59B6",
  "#E67E22",
];

export function ChartsSection({
  lineChartData,
  pieChartData,
}: ChartsSectionProps) {
  const { t } = useLang();
  const hasData = lineChartData.length > 0 || pieChartData.length > 0;

  return (
    <section className="charts-section">
      <div className="chart-container line-chart-box">
        <h3>{t.chartDynamics}</h3>
        {!hasData ? (
          <div className="chart-empty-state">
            <span className="empty-chart-icon">📈</span>
            <p>{t.chartEmptyLine}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={lineChartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" stroke="#8884d8" />
              <YAxis stroke="#8884d8" width={80} />
              <Tooltip
                formatter={(value) => `€${Number(value || 0).toFixed(2)}`}
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  padding: "10px 15px",
                }}
                itemStyle={{
                  color: "#2c3e50",
                  fontWeight: "bold",
                  padding: 0,
                  margin: "4px 0",
                }}
                labelStyle={{ display: "none" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="balance"
                name={t.statBalance}
                stroke="#3498db"
                strokeWidth={3}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="income"
                name={t.statIncome}
                stroke="#2ecc71"
                strokeWidth={3}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                name={t.statExpense}
                stroke="#e74c3c"
                strokeWidth={3}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="chart-container pie-chart-box">
        <h3>{t.chartStruct}</h3>
        {pieChartData.length === 0 ? (
          <div className="chart-empty-state">
            <span className="empty-chart-icon">🥧</span>
            <p>{t.chartEmptyPie}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {pieChartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `€${Number(value || 0).toFixed(2)}`}
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                itemStyle={{ color: "#2c3e50", fontWeight: "bold" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
