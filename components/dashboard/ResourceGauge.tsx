const THRESHOLD_WARNING = 75;
const THRESHOLD_CRITICAL = 90;

interface ResourceGaugeProps {
  label: string;
  used: number;
  total: number;
  unit: string;
  showAlert?: boolean;
}

const colorMap = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
};

function getColor(percent: number) {
  if (percent >= THRESHOLD_CRITICAL / 100) return "red";
  if (percent >= THRESHOLD_WARNING / 100) return "yellow";
  if (percent >= 0.5) return "green";
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

export function ResourceGauge({ label, used, total, unit, showAlert }: ResourceGaugeProps) {
  const percent = total > 0 ? used / total : 0;
  const color = getColor(percent);
  const isWarning = percent >= THRESHOLD_WARNING / 100;
  const isCritical = percent >= THRESHOLD_CRITICAL / 100;

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${isCritical ? "ring-2 ring-red-300" : isWarning ? "ring-2 ring-yellow-300" : ""}`}>
      <div className="flex justify-between items-center mb-1">
        <p className="text-sm text-gray-500">{label}</p>
        {showAlert && isCritical && (
          <span className="text-xs text-red-600 font-medium">CRITICAL</span>
        )}
        {showAlert && isWarning && !isCritical && (
          <span className="text-xs text-yellow-600 font-medium">WARNING</span>
        )}
      </div>
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
