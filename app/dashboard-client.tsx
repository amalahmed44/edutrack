"use client";

import Link from "next/link";
import Sidebar from "./components/sidebar";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  BriefcaseBusiness,
  CreditCard,
  DollarSign,
  UserCheck,
  ArrowUpRight,
  Activity,
  BarChart3,
  FileText,
} from "lucide-react";

type Student = {
  id: string;
  full_name: string;
  city?: string;
  country?: string;
  created_at?: string;
};

type Education = {
  id: string;
  student_id: string;
  institution?: string;
  program?: string;
  level?: string;
  status?: string;
  university_fee?: number;
  amount_paid?: number;
  remaining_balance?: number;
};

type Employment = {
  id: string;
  student_id: string;
  company_name?: string;
  job_title?: string;
  status?: string;
  verified?: boolean;
};

type Payment = {
  id: string;
  student_id: string;
  amount?: number;
  payment_date?: string;
  payment_month?: string;
  status?: string;
};

type Sponsor = {
  id: string;
  education_record_id: string;
  sponsor_name?: string;
  amount?: number;
};

type Props = {
  students: Student[];
  education: Education[];
  employment: Employment[];
  payments: Payment[];
  sponsors: Sponsor[];
};

export default function DashboardClient({
  students,
  education,
  employment,
  payments,
  sponsors,
}: Props) {
  const stats = useMemo(() => {
    const graduated = education.filter(
      (item) => item.status?.toLowerCase() === "graduated"
    ).length;

    const employed = employment.filter(
      (item) => item.status?.toLowerCase() === "employed"
    ).length;

    const verified = employment.filter(
      (item) => item.verified
    ).length;

    const collected = payments
      .filter((item) => item.status?.toLowerCase() === "paid")
      .reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );

    const unpaid = payments.filter(
      (item) => item.status?.toLowerCase() === "unpaid"
    ).length;

    const remaining = education.reduce(
      (sum, item) =>
        sum + Number(item.remaining_balance || 0),
      0
    );

    const sponsored = sponsors.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    return {
      students: students.length,
      education: education.length,
      graduated,
      employed,
      verified,
      collected,
      unpaid,
      remaining,
      sponsored,
    };
  }, [
    students,
    education,
    employment,
    payments,
    sponsors,
  ]);

  const graduationRate =
    stats.students > 0
      ? Math.round(
          (stats.graduated / stats.students) * 100
        )
      : 0;

  const employmentRate =
    stats.students > 0
      ? Math.round(
          (stats.employed / stats.students) * 100
        )
      : 0;

  const monthlyPayments = useMemo(() => {
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();

      date.setMonth(date.getMonth() - i);

      const year = date.getFullYear();
      const month = date.getMonth();

      const total = payments
        .filter((payment) => {
          if (
            payment.status?.toLowerCase() !== "paid"
          ) {
            return false;
          }

          const paymentDate = new Date(
            payment.payment_date ||
              payment.payment_month ||
              ""
          );

          return (
            paymentDate.getFullYear() === year &&
            paymentDate.getMonth() === month
          );
        })
        .reduce(
          (sum, payment) =>
            sum + Number(payment.amount || 0),
          0
        );

      months.push({
        label: date.toLocaleDateString("en-US", {
          month: "short",
        }),
        total,
      });
    }

    return months;
  }, [payments]);

  const maxPayment = Math.max(
    ...monthlyPayments.map(
      (item) => item.total
    ),
    10
  );

  const cards = [
    {
      title: "Students",
      value: stats.students,
      description: "Manage students",
      href: "/students",
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Education",
      value: stats.education,
      description: "Education records",
      href: "/education",
      icon: GraduationCap,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Employment",
      value: stats.employed,
      description: "Employment tracking",
      href: "/employment",
      icon: BriefcaseBusiness,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      title: "Payments",
      value: `$${stats.collected}`,
      description: "Monthly contributions",
      href: "/payments",
      icon: CreditCard,
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="min-h-screen pl-20 lg:pl-64">
        <div className="relative overflow-hidden p-6 lg:p-10">

          {/* Background animation */}
          <motion.div
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl"
          />

          <motion.div
            animate={{
              x: [0, -50, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-purple-300/20 blur-3xl"
          />

          <div className="relative">

            {/* HEADER */}
            <motion.div
              initial={{
                opacity: 0,
                y: -20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center"
            >
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-600">
                  <Activity size={16} />
                  LIVE OVERVIEW
                </div>

                <h1 className="text-4xl font-black text-slate-900">
                  Dashboard
                </h1>

                <p className="mt-2 text-slate-500">
                  Manage the complete education journey.
                </p>
              </div>

              <Link
                href="/reports"
                className="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-blue-600"
              >
                <BarChart3 size={18} />
                Reports
              </Link>
            </motion.div>

            {/* CLICKABLE CARDS */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((card, index) => {
                const Icon = card.icon;

                return (
                  <motion.div
                    key={card.title}
                    initial={{
                      opacity: 0,
                      y: 30,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.1,
                    }}
                    whileHover={{
                      y: -8,
                      scale: 1.02,
                    }}
                  >
                    <Link
                      href={card.href}
                      className={`group relative block overflow-hidden rounded-3xl bg-gradient-to-br ${card.gradient} p-6 text-white shadow-xl`}
                    >
                      <Icon
                        size={140}
                        className="absolute -right-8 -top-8 opacity-10 transition duration-500 group-hover:rotate-12 group-hover:scale-110"
                      />

                      <div className="relative">
                        <div className="mb-8 flex items-center justify-between">
                          <div className="rounded-2xl bg-white/20 p-3">
                            <Icon size={24} />
                          </div>

                          <ArrowUpRight
                            size={20}
                            className="transition group-hover:-translate-y-1 group-hover:translate-x-1"
                          />
                        </div>

                        <p className="text-sm font-semibold text-white/80">
                          {card.title}
                        </p>

                        <h2 className="mt-1 text-4xl font-black">
                          {card.value}
                        </h2>

                        <p className="mt-2 text-xs text-white/70">
                          {card.description}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* EDUCATION / EMPLOYMENT / PAYMENT */}
            <div className="mt-6 grid gap-5 lg:grid-cols-3">

              {/* Education */}
              <Link
                href="/education"
                className="group rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Education
                    </p>

                    <h2 className="mt-1 text-2xl font-black">
                      Graduation Progress
                    </h2>
                  </div>

                  <GraduationCap className="text-purple-500" />
                </div>

                <div className="mt-7">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-500">
                      Graduated
                    </span>

                    <span className="font-bold">
                      {stats.graduated} / {stats.students}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${graduationRate}%`,
                      }}
                      transition={{
                        duration: 1,
                      }}
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                  </div>

                  <p className="mt-3 text-sm font-bold text-purple-600">
                    {graduationRate}% complete
                  </p>
                </div>
              </Link>

              {/* Employment */}
              <Link
                href="/employment"
                className="group rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Employment
                    </p>

                    <h2 className="mt-1 text-2xl font-black">
                      Job Verification
                    </h2>
                  </div>

                  <UserCheck className="text-emerald-500" />
                </div>

                <div className="mt-7">
                  <p className="text-4xl font-black text-emerald-600">
                    {stats.verified}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    verified employments
                  </p>

                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          stats.employed
                            ? Math.min(
                                (stats.verified /
                                  stats.employed) *
                                  100,
                                100
                              )
                            : 0
                        }%`,
                      }}
                      transition={{
                        duration: 1,
                      }}
                      className="h-full rounded-full bg-emerald-500"
                    />
                  </div>
                </div>
              </Link>

              {/* Payments */}
              <Link
                href="/payments"
                className="group rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Payments
                    </p>

                    <h2 className="mt-1 text-2xl font-black">
                      Outstanding
                    </h2>
                  </div>

                  <DollarSign className="text-orange-500" />
                </div>

                <div className="mt-7">
                  <p className="text-4xl font-black text-orange-500">
                    {stats.unpaid}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    unpaid records
                  </p>

                  <p className="mt-4 text-sm font-bold text-slate-700">
                    ${stats.remaining.toLocaleString()} education balance
                  </p>
                </div>
              </Link>
            </div>

            {/* CHART */}
            <motion.div
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.5,
              }}
              className="mt-6 rounded-3xl border bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Contributions
                  </p>

                  <h2 className="text-2xl font-black">
                    Monthly Payment Activity
                  </h2>
                </div>

                <CreditCard className="text-blue-500" />
              </div>

              <div className="mt-8 flex h-64 items-end gap-3 sm:gap-6">
                {monthlyPayments.map(
                  (month, index) => {
                    const height = Math.max(
                      (month.total / maxPayment) *
                        100,
                      month.total > 0 ? 8 : 2
                    );

                    return (
                      <div
                        key={`${month.label}-${index}`}
                        className="flex h-full flex-1 flex-col items-center justify-end"
                      >
                        <span className="mb-2 text-xs font-bold text-slate-500">
                          ${month.total}
                        </span>

                        <motion.div
                          initial={{
                            height: 0,
                          }}
                          animate={{
                            height: `${height}%`,
                          }}
                          transition={{
                            delay:
                              0.7 + index * 0.1,
                            duration: 0.8,
                          }}
                          className="w-full max-w-20 rounded-t-2xl bg-gradient-to-t from-blue-600 to-cyan-400"
                        />

                        <span className="mt-3 text-xs font-bold text-slate-500">
                          {month.label}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </motion.div>

            {/* RECENT STUDENTS */}
            <motion.div
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.7,
              }}
              className="mt-6 rounded-3xl border bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Latest registrations
                  </p>

                  <h2 className="text-2xl font-black">
                    Recent Students
                  </h2>
                </div>

                <Link
                  href="/students"
                  className="flex items-center gap-1 text-sm font-bold text-blue-600"
                >
                  View all
                  <ArrowUpRight size={16} />
                </Link>
              </div>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {students
                  .slice(0, 6)
                  .map((student) => (
                    <Link
                      key={student.id}
                      href="/students"
                      className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 transition hover:-translate-y-1 hover:bg-blue-50"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 font-bold text-white">
                        {student.full_name
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-bold">
                          {student.full_name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {student.city ||
                            student.country ||
                            "Location not provided"}
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
            </motion.div>

            {/* REPORTS */}
            <Link
              href="/reports"
              className="mt-6 flex items-center justify-between rounded-3xl bg-gradient-to-r from-slate-900 to-blue-950 p-6 text-white shadow-xl transition hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-white/10 p-3">
                  <FileText size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-black">
                    Open Reports
                  </h2>

                  <p className="text-sm text-slate-300">
                    Search, filter and export platform data.
                  </p>
                </div>
              </div>

              <ArrowUpRight size={24} />
            </Link>

          </div>
        </div>
      </main>
    </div>
  );
}