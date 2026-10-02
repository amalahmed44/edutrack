"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Users,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Student = {
  id: string;
  full_name: string;
};

type Employment = {
  student_id: string;
  status: string | null;
};

type Payment = {
  id: string;
  student_id: string;
  amount: number;
  payment_date: string;
  payment_month: string | null;
  due_month: string | null;
  status: string | null;
  notes: string | null;
};

type PaymentRow = {
  student: Student;
  payment: Payment | null;
};

const MONTHLY_AMOUNT = 10;

export default function PaymentsPage() {
  const supabase = createClient();

  const [students, setStudents] = useState<Student[]>([]);
  const [employedIds, setEmployedIds] = useState<string[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);

    const [studentsResult, employmentResult, paymentsResult] =
      await Promise.all([
        supabase
          .from("students")
          .select("id, full_name")
          .order("full_name"),

        supabase
          .from("employment_records")
          .select("student_id, status")
          .eq("status", "Employed"),

        supabase
          .from("payments")
          .select("*")
          .order("payment_date", { ascending: false }),
      ]);

    if (studentsResult.data) {
      setStudents(studentsResult.data);
    }

    if (employmentResult.data) {
      setEmployedIds(
        employmentResult.data.map((item: Employment) => item.student_id)
      );
    }

    if (paymentsResult.data) {
      setPayments(paymentsResult.data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const employedStudents = useMemo(() => {
    return students.filter((student) => employedIds.includes(student.id));
  }, [students, employedIds]);

  const rows: PaymentRow[] = useMemo(() => {
    return employedStudents
      .map((student) => {
        const payment =
          payments.find(
            (item) =>
              item.student_id === student.id &&
              (item.due_month || item.payment_month || "").slice(0, 7) ===
                selectedMonth
          ) ?? null;

        return {
          student,
          payment,
        };
      })
      .filter((row) =>
        row.student.full_name
          .toLowerCase()
          .includes(search.toLowerCase())
      );
  }, [employedStudents, payments, selectedMonth, search]);

  const paidCount = rows.filter(
    (row) => row.payment?.status === "Paid"
  ).length;

  const unpaidCount = rows.length - paidCount;

  const paidAmount = rows.reduce(
    (total, row) =>
      total + (row.payment?.status === "Paid" ? Number(row.payment.amount) : 0),
    0
  );

  async function markAsPaid(studentId: string) {
    const existing = payments.find(
      (payment) =>
        payment.student_id === studentId &&
        (payment.due_month || payment.payment_month || "").slice(0, 7) ===
          selectedMonth
    );

    if (existing) {
      const { error } = await supabase
        .from("payments")
        .update({
          amount: MONTHLY_AMOUNT,
          status: "Paid",
          payment_date: new Date().toISOString().slice(0, 10),
          due_month: `${selectedMonth}-01`,
          payment_month: `${selectedMonth}-01`,
        })
        .eq("id", existing.id);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("payments").insert({
        student_id: studentId,
        amount: MONTHLY_AMOUNT,
        payment_date: new Date().toISOString().slice(0, 10),
        payment_month: `${selectedMonth}-01`,
        due_month: `${selectedMonth}-01`,
        status: "Paid",
      });

      if (error) {
        alert(error.message);
        return;
      }
    }

    await loadData();
  }

  async function markAsUnpaid(studentId: string) {
    const existing = payments.find(
      (payment) =>
        payment.student_id === studentId &&
        (payment.due_month || payment.payment_month || "").slice(0, 7) ===
          selectedMonth
    );

    if (!existing) return;

    const { error } = await supabase
      .from("payments")
      .update({
        status: "Unpaid",
      })
      .eq("id", existing.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();
  }

  function formatMonth(month: string) {
    return new Date(`${month}-01`).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="p-8 lg:p-10">
        <div className="animate-pulse text-gray-500">
          Loading payments...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-10">
      {/* HEADER */}
      <div className="mb-8">
        <p className="text-sm font-medium text-gray-500">
          Monthly Contributions
        </p>

        <h1 className="mt-1 text-4xl font-bold tracking-tight">
          Payments
        </h1>

        <p className="mt-2 text-gray-500">
          Track the $10 monthly contribution from every employed student.
        </p>
      </div>

      {/* SUMMARY */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Employed Students"
          value={rows.length}
          icon={Users}
        />

        <SummaryCard
          title="Paid This Month"
          value={paidCount}
          icon={CheckCircle2}
        />

        <SummaryCard
          title="Unpaid This Month"
          value={unpaidCount}
          icon={Clock3}
        />

        <SummaryCard
          title="Collected"
          value={`$${paidAmount.toFixed(2)}`}
          icon={CircleDollarSign}
        />
      </div>

      {/* CONTROLS */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Payment Month</p>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="mt-1 rounded-xl border px-4 py-2 outline-none focus:border-black"
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border px-4 py-2 outline-none focus:border-black md:w-64"
          />
        </div>
      </div>

      {/* MONTH TITLE */}
      <div className="mb-4">
        <h2 className="text-xl font-bold">
          {formatMonth(selectedMonth)}
        </h2>

        <p className="text-sm text-gray-500">
          Required contribution: $10 per employed student
        </p>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Student
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Monthly Amount
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Payment Date
                </th>

                <th className="px-6 py-4 text-right text-sm font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => {
                const paid = row.payment?.status === "Paid";

                return (
                  <motion.tr
                    key={row.student.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-5 font-medium">
                      {row.student.full_name}
                    </td>

                    <td className="px-6 py-5">
                      $10.00
                    </td>

                    <td className="px-6 py-5">
                      {paid ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          <CheckCircle2 size={14} />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                          <Clock3 size={14} />
                          Unpaid
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-500">
                      {row.payment?.payment_date || "—"}
                    </td>

                    <td className="px-6 py-5 text-right">
                      {paid ? (
                        <button
                          onClick={() => markAsUnpaid(row.student.id)}
                          className="rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
                        >
                          Mark Unpaid
                        </button>
                      ) : (
                        <button
                          onClick={() => markAsPaid(row.student.id)}
                          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </motion.tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-gray-500"
                  >
                    No employed students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-xl"
    >
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
        <Icon size={21} />
      </div>

      <p className="text-sm text-gray-500">{title}</p>

      <p className="mt-1 text-3xl font-bold">{value}</p>
    </motion.div>
  );
}