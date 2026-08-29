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
  "#000794",
  "#00743E",
  "#F9D12F",
  "#480064",
  "#E67E22",
  "#8BB200",
  "#D900FF",
  "#00ffE1",
];

export function ChartsSection({
  lineChartData,
  pieChartData,
}: ChartsSectionProps) {
  const { t } = useLang();

  const hasLineData = lineChartData.length > 0;
  const hasPieData = pieChartData.length > 0;

  return (
    <section className="charts-section">
      <div className="chart-container line-chart-box">
        <h3>{t.chartDynamics}</h3>
        {!hasLineData ? (
          <div className="chart-empty-state">
            <span className="empty-chart-icon">📈</span>
            <p>{t.chartEmptyLine}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={lineChartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" stroke="#8884d8" />
              <YAxis stroke="#8884d8" width={45} />
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
              <Legend
                verticalAlign="top"
                align="center"
                wrapperStyle={{
                  paddingBottom: 12,
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              />
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
        {!hasPieData ? (
          <div className="chart-empty-state">
            <span className="empty-chart-icon">🥧</span>
            <p>{t.chartEmptyPie}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="45%"
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
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
