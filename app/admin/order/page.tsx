"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/DataTable";

interface Order {
  id: number;
  status: string;
  tanggalMulai: string;
  tanggalExpired: string;
  createdAt: string;
  pelanggan: { nama: string; email: string };
  paket: { nama: string; hargaBulanan: string };
  invoice: { status: string }[];
}

const statusColors: Record<string, string> = {
  aktif: "text-green-600 bg-green-100",
  expired: "text-red-600 bg-red-100",
  suspended: "text-yellow-600 bg-yellow-100",
  terminated: "text-gray-600 bg-gray-100",
};

export default function OrderPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/order")
      .then((r) => r.json())
      .then(setOrders);
  }, []);

  function getInvoiceStatus(invoices: { status: string }[]) {
    if (invoices.length === 0) return "-";
    const latest = invoices[invoices.length - 1];
    return latest.status === "lunas" ? "Lunas" : "Belum Lunas";
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Order</h1>
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={[
            { key: "id", label: "ID", render: (item) => `#${item.id}` },
            {
              key: "pelanggan",
              label: "Pelanggan",
              render: (item) => item.pelanggan.nama,
            },
            {
              key: "paket",
              label: "Paket",
              render: (item) => item.paket.nama,
            },
            {
              key: "status",
              label: "Status",
              render: (item) => (
                <span
                  className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                    statusColors[item.status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.status}
                </span>
              ),
            },
            {
              key: "invoiceStatus",
              label: "Invoice",
              render: (item) => getInvoiceStatus(item.invoice),
            },
            {
              key: "createdAt",
              label: "Tanggal Order",
              render: (item) =>
                new Date(item.createdAt).toLocaleDateString("id-ID"),
            },
          ]}
          data={orders}
          onEdit={(item) => router.push(`/admin/order/${item.id}`)}
        />
      </div>
    </div>
  );
}
