"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ResourceGauge } from "@/components/dashboard/ResourceGauge";

interface VMDetail {
  status: string;
  cpu: number;
  maxcpu: number;
  mem: number;
  maxmem: number;
  disk: number;
  maxdisk: number;
  name: string;
  uptime: number;
}

export default function AdminVMControlPage() {
  const params = useParams<{ vmid: string }>();
  const [node, setNode] = useState("");
  const [detail, setDetail] = useState<VMDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const n = prompt("Masukkan nama node Proxmox (contoh: pve):");
    if (n) setNode(n);
  }, []);

  useEffect(() => {
    if (!node) return;
    fetch(`/api/proxmox/vms/${params.vmid}?node=${node}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.detail) setDetail(data.detail);
        else setMessage("Gagal memuat data VM");
      })
      .catch(() => setMessage("Gagal terhubung ke Proxmox"));
  }, [node, params.vmid]);

  async function handleAction(action: "start" | "stop" | "reboot") {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/proxmox/vms/${params.vmid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ node, action }),
      });
      if (res.ok) {
        setMessage(`Perintah ${action} berhasil dikirim`);
        const r = await fetch(`/api/proxmox/vms/${params.vmid}?node=${node}`);
        const data = await r.json();
        if (data.detail) setDetail(data.detail);
      } else {
        const err = await res.json();
        setMessage(err.error || "Gagal");
      }
    } catch {
      setMessage("Gagal terhubung ke Proxmox");
    }
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href="/admin/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
        &larr; Dashboard
      </Link>
      <h1 className="text-2xl font-bold mb-2">Kontrol VM</h1>
      <p className="text-gray-500 text-sm mb-6">VMID: {params.vmid} | Node: {node || "(belum diisi)"}</p>

      {!node && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
          Masukkan nama node Proxmox untuk memulai.
        </div>
      )}

      {detail && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <ResourceGauge label="CPU" used={detail.cpu} total={detail.maxcpu} unit="%" showAlert />
            <ResourceGauge label="RAM" used={detail.mem} total={detail.maxmem} unit="MB" showAlert />
            <ResourceGauge label="Disk" used={detail.disk} total={detail.maxdisk} unit="GB" showAlert />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="flex gap-3">
              {detail.status === "running" ? (
                <>
                  <button
                    onClick={() => handleAction("stop")}
                    disabled={loading}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? "..." : "Stop"}
                  </button>
                  <button
                    onClick={() => handleAction("reboot")}
                    disabled={loading}
                    className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                  >
                    {loading ? "..." : "Reboot"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleAction("start")}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "..." : "Start"}
                </button>
              )}
            </div>
            {message && (
              <p className="mt-4 text-sm text-gray-600">{message}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
