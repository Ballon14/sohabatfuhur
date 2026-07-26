"use client";

import Link from "next/link";
import { ResourceGauge } from "./ResourceGauge";

interface VMCardProps {
  node: string;
  vmid: number;
  name: string;
  status: string;
  cpu: number;
  maxcpu: number;
  mem: number;
  maxmem: number;
  disk: number;
  maxdisk: number;
  uptime: number;
  type: string;
  onAction?: (vmid: number, action: "start" | "stop" | "reboot") => void;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}h`);
  if (h > 0) parts.push(`${h}j`);
  parts.push(`${m}m`);
  return parts.join(" ");
}

export function VMCard({
  node,
  vmid,
  name,
  status,
  cpu,
  maxcpu,
  mem,
  maxmem,
  disk,
  maxdisk,
  uptime,
  type,
  onAction,
}: VMCardProps) {
  const isRunning = status === "running";

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-l-4 p-4 ${
        isRunning ? "border-l-green-500" : "border-l-gray-400"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Link href={`/monitoring/node/${node}/${vmid}`} className="font-semibold hover:text-blue-600">
              {name}
            </Link>
            <span className="text-xs text-gray-400">({type.toUpperCase()})</span>
          </div>
          <p className="text-xs text-gray-500">VMID: {vmid}</p>
        </div>
        <div className="text-right">
          <span
            className={`inline-block px-2 py-0.5 text-xs rounded-full ${
              isRunning
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isRunning ? "Running" : "Stopped"}
          </span>
          {isRunning && (
            <p className="text-xs text-gray-400 mt-1">{formatUptime(uptime)}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {isRunning && (
          <ResourceGauge label="CPU" used={cpu} total={maxcpu} unit="%" />
        )}
        <ResourceGauge
          label="RAM"
          used={mem}
          total={maxmem}
          unit="MB"
        />
        <ResourceGauge
          label="Disk"
          used={disk}
          total={maxdisk}
          unit="GB"
        />
      </div>

      {onAction && (
        <div className="flex gap-2 mt-2">
          {isRunning ? (
            <>
              <button
                onClick={() => onAction(vmid, "stop")}
                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Stop
              </button>
              <button
                onClick={() => onAction(vmid, "reboot")}
                className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
              >
                Reboot
              </button>
            </>
          ) : (
            <button
              onClick={() => onAction(vmid, "start")}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Start
            </button>
          )}
        </div>
      )}
    </div>
  );
}
