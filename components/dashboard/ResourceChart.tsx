"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface DataPoint {
  time: number;
  value: number;
}

interface ResourceChartProps {
  data: { time: number; cpu?: number; mem?: number; netin?: number; netout?: number }[];
  dataKey: "cpu" | "mem" | "netin" | "netout";
  label: string;
  unit: string;
  color?: string;
}

export function ResourceChart({
  data,
  dataKey,
  label,
  unit,
  color = "#3b82f6",
}: ResourceChartProps) {
  const chartData: DataPoint[] = data
    .filter((d) => d[dataKey] !== undefined)
    .map((d) => ({
      time: d.time * 1000,
      value: dataKey === "cpu" ? (d[dataKey] ?? 0) * 100 : d[dataKey] ?? 0,
    }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-2">{label}</p>
        <p className="text-xs text-gray-400">Tidak ada data historis</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="time"
            tickFormatter={(t) => {
              const d = new Date(t);
              return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
            }}
            stroke="#9ca3af"
            fontSize={11}
          />
          <YAxis
            tickFormatter={(v) =>
              unit === "%" ? `${Math.round(v)}%` : `${(v / 1024 / 1024).toFixed(0)}MB`
            }
            stroke="#9ca3af"
            fontSize={11}
          />
          <Tooltip
            labelFormatter={((t: unknown) =>
              new Date(t as string | number | Date).toLocaleString("id-ID")) as never}
            formatter={((value: unknown) => [
              unit === "%"
                ? `${Number(value).toFixed(1)}%`
                : `${(Number(value) / 1024 / 1024).toFixed(1)} MB`,
              label,
            ]) as never}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
