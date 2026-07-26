interface ResourceGaugeProps {
  label: string;
  used: number;
  total: number;
  unit: string;
  color?: "blue" | "green" | "yellow" | "red";
}

const colorMap = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
};

function getColor(percent: number) {
  if (percent >= 90) return "red";
  if (percent >= 75) return "yellow";
  if (percent >= 50) return "green";
  return "blue";
}

function formatValue(value: number, unit: string): string {
  if (unit === "%") return `${Math.round(value * 100)}%`;
  if (unit === "GB" || unit === "MB") {
    const gb = value / (unit === "MB" ? 1024 : 1);
    return `${gb.toFixed(1)} ${gb >= 1 ? "GB" : "MB"}`;
  }
  return `${value} ${unit}`;
}

export function ResourceGauge({ label, used, total, unit }: ResourceGaugeProps) {
  const percent = total > 0 ? used / total : 0;
  const color = getColor(percent);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-lg font-bold">
          {formatValue(used, unit)}
        </span>
        <span className="text-sm text-gray-400">
          / {formatValue(total, unit)}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colorMap[color]} h-2 rounded-full transition-all`}
          style={{ width: `${Math.min(percent * 100, 100)}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{Math.round(percent * 100)}% digunakan</p>
    </div>
  );
}
