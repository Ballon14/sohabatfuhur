import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <Link href="/admin/dashboard" className="text-lg font-bold">
            Sohabat Fuhur
          </Link>
          <p className="text-xs text-gray-400">Panel Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavItem href="/admin/dashboard" label="Dashboard" />
          <NavItem href="/admin/paket" label="Paket VPS" />
          <NavItem href="/admin/pelanggan" label="Pelanggan" />
          <NavItem href="/admin/order" label="Order" />
          <NavItem href="/admin/invoice" label="Invoice" />
        </nav>
        <div className="p-4 border-t border-gray-700">
          <Link href="/" className="text-sm text-gray-400 hover:text-white block">
            &larr; Ke Website
          </Link>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded hover:bg-gray-700 text-sm"
    >
      {label}
    </Link>
  );
}
