"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  X,
  Download,
  Users,
  GraduationCap,
  Briefcase,
  CreditCard,
  ChevronDown,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Student = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  gender: string | null;
  city: string | null;
  country: string | null;
  tribe: string | null;
  sub_tribe: string | null;
  clan: string | null;
  marital_status: string | null;
  family_size: number | null;
  siblings_count: number | null;
  birth_order: number | null;
  household_income: number | null;
  financial_need: string | null;
  father_name: string | null;
  mother_name: string | null;
  guardian_name: string | null;
};

type Education = {
  id: string;
  student_id: string;
  institution: string;
  program: string | null;
  level: string | null;
  status: string | null;
  graduation_date: string | null;
  university_fee: number | null;
  amount_paid: number | null;
  remaining_balance: number | null;
};

type Sponsor = {
  id: string;
  education_record_id: string;
  sponsor_name: string;
  amount: number;
};

type Employment = {
  id: string;
  student_id: string;
  company_name: string | null;
  job_title: string | null;
  status: string | null;
  verified: boolean;
};

type Payment = {
  id: string;
  student_id: string;
  amount: number;
  payment_date: string;
  due_month: string | null;
  payment_month: string | null;
  status: string | null;
};

type ReportRow = {
  student: Student;
  education: Education[];
  sponsors: Sponsor[];
  employment: Employment[];
  payments: Payment[];
};

export default function ReportsPage() {
  const supabase = createClient();

  const [students, setStudents] = useState<Student[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [employment, setEmployment] = useState<Employment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [gender, setGender] = useState("All");
  const [city, setCity] = useState("All");
  const [educationStatus, setEducationStatus] = useState("All");
  const [university, setUniversity] = useState("All");
  const [educationLevel, setEducationLevel] = useState("All");
  const [sponsor, setSponsor] = useState("All");
  const [employmentStatus, setEmploymentStatus] = useState("All");
  const [verified, setVerified] = useState("All");
  const [paymentMonth, setPaymentMonth] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("All");
  const [financialNeed, setFinancialNeed] = useState("All");
  const [hasSponsor, setHasSponsor] = useState("All");

  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const [
        studentsResult,
        educationResult,
        sponsorsResult,
        employmentResult,
        paymentsResult,
      ] = await Promise.all([
        supabase.from("students").select("*"),

        supabase.from("education_records").select("*"),

        supabase.from("education_sponsors").select("*"),

        supabase.from("employment_records").select("*"),

        supabase.from("payments").select("*"),
      ]);

      setStudents(studentsResult.data ?? []);
      setEducation(educationResult.data ?? []);
      setSponsors(sponsorsResult.data ?? []);
      setEmployment(employmentResult.data ?? []);
      setPayments(paymentsResult.data ?? []);

      setLoading(false);
    }

    loadData();
  }, []);

  const rows = useMemo<ReportRow[]>(() => {
    return students.map((student) => ({
      student,

      education: education.filter(
        (item) => item.student_id === student.id
      ),

      sponsors: sponsors.filter((sponsor) =>
        education.some(
          (item) =>
            item.id === sponsor.education_record_id &&
            item.student_id === student.id
        )
      ),

      employment: employment.filter(
        (item) => item.student_id === student.id
      ),

      payments: payments.filter(
        (item) => item.student_id === student.id
      ),
    }));
  }, [students, education, sponsors, employment, payments]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const student = row.student;

      /* SEARCH */

      const searchText = search.toLowerCase().trim();

      const searchableText = [
        student.full_name,
        student.email,
        student.phone,
        student.city,
        student.country,
        student.tribe,
        student.sub_tribe,
        student.clan,
        student.father_name,
        student.mother_name,
        student.guardian_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (searchText && !searchableText.includes(searchText)) {
        return false;
      }

      /* STUDENT FILTERS */

      if (gender !== "All" && student.gender !== gender) {
        return false;
      }

      if (city !== "All" && student.city !== city) {
        return false;
      }

      if (
        financialNeed !== "All" &&
        student.financial_need !== financialNeed
      ) {
        return false;
      }

      /* EDUCATION FILTERS */

      if (
        educationStatus !== "All" &&
        !row.education.some(
          (item) => item.status === educationStatus
        )
      ) {
        return false;
      }

      if (
        university !== "All" &&
        !row.education.some(
          (item) => item.institution === university
        )
      ) {
        return false;
      }

      if (
        educationLevel !== "All" &&
        !row.education.some(
          (item) => item.level === educationLevel
        )
      ) {
        return false;
      }

      /* SPONSOR FILTERS */

      if (hasSponsor === "Yes" && row.sponsors.length === 0) {
        return false;
      }

      if (hasSponsor === "No" && row.sponsors.length > 0) {
        return false;
      }

      if (
        sponsor !== "All" &&
        !row.sponsors.some(
          (item) => item.sponsor_name === sponsor
        )
      ) {
        return false;
      }

      /* EMPLOYMENT FILTERS */

      if (
        employmentStatus !== "All" &&
        !row.employment.some(
          (item) => item.status === employmentStatus
        )
      ) {
        return false;
      }

      if (verified !== "All") {
        const wanted = verified === "Verified";

        if (
          !row.employment.some(
            (item) => item.verified === wanted
          )
        ) {
          return false;
        }
      }

      /* PAYMENT FILTERS */

      if (paymentMonth) {
        const hasMonth = row.payments.some((payment) => {
          const month = (
            payment.due_month ||
            payment.payment_month ||
            ""
          ).slice(0, 7);

          return month === paymentMonth;
        });

        if (!hasMonth) {
          return false;
        }
      }

      if (paymentStatus !== "All") {
        if (paymentStatus === "Paid") {
          const hasPaid = row.payments.some(
            (payment) => payment.status === "Paid"
          );

          if (!hasPaid) return false;
        }

        if (paymentStatus === "Unpaid") {
          const hasUnpaid = row.payments.some(
            (payment) => payment.status === "Unpaid"
          );

          if (!hasUnpaid) return false;
        }

        if (paymentStatus === "No Payment Record") {
          if (row.payments.length > 0) return false;
        }
      }

      return true;
    });
  }, [
    rows,
    search,
    gender,
    city,
    educationStatus,
    university,
    educationLevel,
    sponsor,
    employmentStatus,
    verified,
    paymentMonth,
    paymentStatus,
    financialNeed,
    hasSponsor,
  ]);

  const filterCount = [
    gender !== "All",
    city !== "All",
    educationStatus !== "All",
    university !== "All",
    educationLevel !== "All",
    sponsor !== "All",
    employmentStatus !== "All",
    verified !== "All",
    paymentMonth !== "",
    paymentStatus !== "All",
    financialNeed !== "All",
    hasSponsor !== "All",
  ].filter(Boolean).length;

  function clearFilters() {
    setSearch("");
    setGender("All");
    setCity("All");
    setEducationStatus("All");
    setUniversity("All");
    setEducationLevel("All");
    setSponsor("All");
    setEmploymentStatus("All");
    setVerified("All");
    setPaymentMonth("");
    setPaymentStatus("All");
    setFinancialNeed("All");
    setHasSponsor("All");
  }

  function getEducation(row: ReportRow) {
    return row.education[0];
  }

  function getEmployment(row: ReportRow) {
    return row.employment[0];
  }

  function getPayment(row: ReportRow) {
    if (!paymentMonth) {
      return row.payments[0];
    }

    return row.payments.find(
      (payment) =>
        (
          payment.due_month ||
          payment.payment_month ||
          ""
        ).slice(0, 7) === paymentMonth
    );
  }

  function exportCSV() {
    const headers = [
      "Student",
      "Gender",
      "City",
      "Tribe",
      "University",
      "Program",
      "Education Status",
      "University Fee",
      "Amount Paid",
      "Remaining Balance",
      "Sponsors",
      "Sponsor Amount",
      "Employment",
      "Company",
      "Job Title",
      "Verified",
      "Payment Status",
      "Payment Amount",
      "Payment Date",
    ];

    const csvRows = filteredRows.map((row) => {
      const edu = getEducation(row);
      const job = getEmployment(row);
      const payment = getPayment(row);

      return [
        row.student.full_name,
        row.student.gender || "",
        row.student.city || "",
        row.student.tribe || "",
        edu?.institution || "",
        edu?.program || "",
        edu?.status || "",
        edu?.university_fee ?? "",
        edu?.amount_paid ?? "",
        edu?.remaining_balance ?? "",
        row.sponsors.map((s) => s.sponsor_name).join("; "),
        row.sponsors
          .reduce((sum, s) => sum + Number(s.amount || 0), 0)
          .toFixed(2),
        job?.status || "",
        job?.company_name || "",
        job?.job_title || "",
        job?.verified ? "Yes" : "No",
        payment?.status || "",
        payment?.amount ?? "",
        payment?.payment_date || "",
      ];
    });

    const csv = [
      headers,
      ...csvRows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `education-report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    link.click();

    URL.revokeObjectURL(url);
  }

  const cities = unique(
    students.map((student) => student.city)
  );

  const universities = unique(
    education.map((item) => item.institution)
  );

  const levels = unique(
    education.map((item) => item.level)
  );

  const sponsorsList = unique(
    sponsors.map((item) => item.sponsor_name)
  );

  const genders = unique(
    students.map((student) => student.gender)
  );

  const financialNeeds = unique(
    students.map((student) => student.financial_need)
  );

  if (loading) {
    return (
      <div className="p-8 lg:p-10">
        <p className="text-gray-500">
          Loading report data...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-10">
      {/* HEADER */}

      <div className="mb-8">
        <p className="text-sm font-medium text-gray-500">
          Management & Advanced Search
        </p>

        <h1 className="mt-1 text-4xl font-bold tracking-tight">
          Reports
        </h1>

        <p className="mt-2 text-gray-500">
          Filter and analyze students across education, sponsors,
          employment and payments.
        </p>
      </div>

      {/* SEARCH BAR */}

      <div className="mb-5 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, email, city, tribe, clan, parent..."
              className="w-full rounded-xl border py-3 pl-11 pr-4 outline-none focus:border-black"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
          >
            <Filter size={18} />

            Filters

            {filterCount > 0 && (
              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-black">
                {filterCount}
              </span>
            )}

            <ChevronDown
              size={16}
              className={`transition ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition hover:bg-gray-50"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-8 overflow-hidden rounded-2xl border bg-white shadow-sm"
        >
          <div className="border-b p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Advanced Filters
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Combine multiple filters to find exactly the
                  students you need.
                </p>
              </div>

              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black"
              >
                <X size={16} />
                Clear all
              </button>
            </div>
          </div>

          <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <FilterSelect
              label="Gender"
              value={gender}
              onChange={setGender}
              options={genders}
            />

            <FilterSelect
              label="City"
              value={city}
              onChange={setCity}
              options={cities}
            />

            <FilterSelect
              label="Financial Need"
              value={financialNeed}
              onChange={setFinancialNeed}
              options={financialNeeds}
            />

            <FilterSelect
              label="Education Status"
              value={educationStatus}
              onChange={setEducationStatus}
              options={[
                "Studying",
                "Graduated",
                "Paused",
              ]}
            />

            <FilterSelect
              label="University"
              value={university}
              onChange={setUniversity}
              options={universities}
            />

            <FilterSelect
              label="Education Level"
              value={educationLevel}
              onChange={setEducationLevel}
              options={levels}
            />

            <FilterSelect
              label="Has Sponsor"
              value={hasSponsor}
              onChange={setHasSponsor}
              options={["Yes", "No"]}
            />

            <FilterSelect
              label="Sponsor"
              value={sponsor}
              onChange={setSponsor}
              options={sponsorsList}
            />

            <FilterSelect
              label="Employment"
              value={employmentStatus}
              onChange={setEmploymentStatus}
              options={[
                "Employed",
                "Unemployed",
                "Self-Employed",
                "Internship",
                "Contract",
              ]}
            />

            <FilterSelect
              label="Employment Verification"
              value={verified}
              onChange={setVerified}
              options={[
                "Verified",
                "Not Verified",
              ]}
            />

            <div>
              <label className="mb-2 block text-sm font-medium">
                Payment Month
              </label>

              <input
                type="month"
                value={paymentMonth}
                onChange={(e) =>
                  setPaymentMonth(e.target.value)
                }
                className="w-full rounded-xl border px-3 py-2.5 outline-none focus:border-black"
              />
            </div>

            <FilterSelect
              label="Payment Status"
              value={paymentStatus}
              onChange={setPaymentStatus}
              options={[
                "Paid",
                "Unpaid",
                "No Payment Record",
              ]}
            />
          </div>
        </motion.div>
      )}

      {/* RESULTS HEADER */}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">
            Results
          </h2>

          <p className="text-sm text-gray-500">
            {filteredRows.length} student
            {filteredRows.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm shadow-sm ring-1 ring-gray-100">
          <Users size={17} />
          {filteredRows.length} matching
        </div>
      </div>

      {/* RESULTS TABLE */}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1500px]">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Student
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Education
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Sponsor
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Employment
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Payment
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Balance
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row, index) => {
                const edu = getEducation(row);
                const job = getEmployment(row);
                const payment = getPayment(row);

                const sponsorTotal = row.sponsors.reduce(
                  (sum, item) =>
                    sum + Number(item.amount || 0),
                  0
                );

                return (
                  <motion.tr
                    key={row.student.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(index * 0.02, 0.4),
                    }}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    {/* STUDENT */}

                    <td className="px-5 py-5">
                      <p className="font-semibold">
                        {row.student.full_name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {row.student.city || "No city"}
                      </p>

                      <p className="text-xs text-gray-400">
                        {row.student.tribe || "No tribe"}
                      </p>
                    </td>

                    {/* EDUCATION */}

                    <td className="px-5 py-5">
                      {edu ? (
                        <>
                          <p className="font-medium">
                            {edu.institution}
                          </p>

                          <p className="text-xs text-gray-500">
                            {edu.program || "No program"}
                          </p>

                          <StatusBadge
                            value={edu.status || "Unknown"}
                          />
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">
                          No education record
                        </span>
                      )}
                    </td>

                    {/* SPONSOR */}

                    <td className="px-5 py-5">
                      {row.sponsors.length > 0 ? (
                        <>
                          {row.sponsors.map((item) => (
                            <div
                              key={item.id}
                              className="mb-1 last:mb-0"
                            >
                              <p className="text-sm font-medium">
                                {item.sponsor_name}
                              </p>

                              <p className="text-xs text-gray-500">
                                ${Number(item.amount).toFixed(2)}
                              </p>
                            </div>
                          ))}

                          <p className="mt-2 border-t pt-2 text-xs font-semibold">
                            Total: ${sponsorTotal.toFixed(2)}
                          </p>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">
                          No sponsor
                        </span>
                      )}
                    </td>

                    {/* EMPLOYMENT */}

                    <td className="px-5 py-5">
                      {job ? (
                        <>
                          <StatusBadge
                            value={job.status || "Unknown"}
                          />

                          <p className="mt-1 text-sm">
                            {job.company_name || "No company"}
                          </p>

                          <p className="text-xs text-gray-500">
                            {job.job_title || "No job title"}
                          </p>

                          {job.verified && (
                            <span className="mt-1 inline-block text-xs font-medium text-green-600">
                              ✓ Verified
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">
                          No employment
                        </span>
                      )}
                    </td>

                    {/* PAYMENT */}

                    <td className="px-5 py-5">
                      {payment ? (
                        <>
                          <StatusBadge
                            value={payment.status || "Unknown"}
                          />

                          <p className="mt-1 text-sm font-medium">
                            ${Number(payment.amount).toFixed(2)}
                          </p>

                          <p className="text-xs text-gray-500">
                            {payment.payment_date}
                          </p>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">
                          No payment
                        </span>
                      )}
                    </td>

                    {/* BALANCE */}

                    <td className="px-5 py-5">
                      {edu ? (
                        <>
                          <p className="font-semibold">
                            $
                            {Number(
                              edu.remaining_balance || 0
                            ).toFixed(2)}
                          </p>

                          <p className="text-xs text-gray-500">
                            of $
                            {Number(
                              edu.university_fee || 0
                            ).toFixed(2)}
                          </p>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                  </motion.tr>
                );
              })}

              {filteredRows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-20 text-center"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                      <Search size={24} />
                    </div>

                    <h3 className="mt-4 font-semibold">
                      No matching students
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Try changing or clearing your filters.
                    </p>

                    <button
                      onClick={clearFilters}
                      className="mt-4 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
                    >
                      Clear Filters
                    </button>
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

/* -------------------------
   FILTER COMPONENT
------------------------- */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: (string | null)[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border bg-white px-3 py-2.5 outline-none focus:border-black"
      >
        <option value="All">All</option>

        {options
          .filter(Boolean)
          .filter(
            (item, index, array) =>
              array.indexOf(item) === index
          )
          .map((option) => (
            <option key={option!} value={option!}>
              {option}
            </option>
          ))}
      </select>
    </div>
  );
}

function StatusBadge({
  value,
}: {
  value: string;
}) {
  return (
    <span className="mt-1 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium">
      {value}
    </span>
  );
}

function unique(values: (string | null)[]) {
  return Array.from(
    new Set(
      values.filter(
        (value): value is string =>
          Boolean(value && value.trim())
      )
    )
  ).sort();
}