import Sidebar from "@/app/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="min-h-screen pl-20 lg:pl-64">
        {children}
      </main>
    </div>
  );
}