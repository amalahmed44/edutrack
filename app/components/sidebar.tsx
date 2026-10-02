"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  Briefcase,
  CreditCard,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

const menu = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Students", href: "/students", icon: Users },
  { name: "Education", href: "/education", icon: BookOpen },
  { name: "Employment", href: "/employment", icon: Briefcase },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r bg-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-20 items-center justify-between border-b px-5">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
              <GraduationCap size={22} />
            </div>

            <div>
              <h1 className="font-bold">EduTrack</h1>
              <p className="text-xs text-gray-500">Admin Portal</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2 hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {menu.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
                active
                  ? "bg-black text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100 hover:text-black"
              }`}
            >
              <Icon size={20} />

              {!collapsed && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-gray-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={20} />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}