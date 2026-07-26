"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/DataTable";

interface Invoice {
  id: number;
  nomorInvoice: string;
  jumlah: string;
  status: string;
  tanggalTerbit: string;
  tanggalJatuhTempo: string;
  order: {
    pelanggan: { nama: string };
    paket: { nama: string };
  };
  pembayaran: { id: number }[];
}

const statusColors: Record<string, string> = {
  lunas: "text-green-600 bg-green-100",
  belum_dibayar: "text-red-600 bg-red-100",
  sebagian: "text-yellow-600 bg-yellow-100",
};

export default function InvoicePage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    fetch("/api/invoice")
      .then((r) => r.json())
      .then(setInvoices);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Invoice</h1>
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={[
            { key: "nomorInvoice", label: "No. Invoice" },
            {
              key: "pelanggan",
              label: "Pelanggan",
              render: (item) => item.order.pelanggan.nama,
            },
            {
              key: "paket",
              label: "Paket",
              render: (item) => item.order.paket.nama,
            },
            {
              key: "jumlah",
              label: "Jumlah",
              render: (item) =>
                `Rp ${Number(item.jumlah).toLocaleString("id-ID")}`,
            },
            {
              key: "status",
              label: "Status",
              render: (item) => (
                <span
                  className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                    statusColors[item.status] || "bg-gray-100"
                  }`}
                >
                  {item.status === "belum_dibayar"
                    ? "Belum Dibayar"
                    : item.status === "lunas"
                    ? "Lunas"
                    : item.status === "sebagian"
                    ? "Sebagian"
                    : item.status}
                </span>
              ),
            },
            {
              key: "tanggalJatuhTempo",
              label: "Jatuh Tempo",
              render: (item) =>
                new Date(item.tanggalJatuhTempo).toLocaleDateString("id-ID"),
            },
          ]}
          data={invoices}
          onEdit={(item) => router.push(`/admin/invoice/${item.id}`)}
        />
      </div>
    </div>
  );
}
