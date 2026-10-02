"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Briefcase,
  Building2,
  User,
  CheckCircle2,
  XCircle,
  CalendarDays,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Student = {
  id: string;
  full_name: string;
};

type EmploymentRecord = {
  id: string;
  student_id: string;
  company_name: string | null;
  job_title: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  verified: boolean | null;
  created_at: string;
  students?: {
    full_name: string;
  } | null;
};

type FormData = {
  student_id: string;
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string;
  status: string;
  verified: boolean;
};

const emptyForm: FormData = {
  student_id: "",
  company_name: "",
  job_title: "",
  start_date: "",
  end_date: "",
  status: "Employed",
  verified: false,
};

export default function EmploymentPage() {
  const supabase = createClient();

  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<EmploymentRecord[]>([]);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<EmploymentRecord | null>(null);

  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const [studentsResult, recordsResult] = await Promise.all([
      supabase
        .from("students")
        .select("id, full_name")
        .order("full_name"),

      supabase
        .from("employment_records")
        .select(
          `
          *,
          students (
            full_name
          )
        `
        )
        .order("created_at", { ascending: false }),
    ]);

    if (studentsResult.error) {
      alert(studentsResult.error.message);
    } else {
      setStudents(studentsResult.data ?? []);
    }

    if (recordsResult.error) {
      alert(recordsResult.error.message);
    } else {
      setRecords(recordsResult.data ?? []);
    }

    setLoading(false);
  }

  const filteredRecords = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return records;

    return records.filter((record) =>
      [
        record.students?.full_name,
        record.company_name,
        record.job_title,
        record.status,
      ]
        .filter(Boolean)
        .some((value) =>
          value!.toLowerCase().includes(query)
        )
    );
  }, [records, search]);

  function updateField(
    field: keyof FormData,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openAddModal() {
    setEditingRecord(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(record: EmploymentRecord) {
    setEditingRecord(record);

    setForm({
      student_id: record.student_id,
      company_name: record.company_name ?? "",
      job_title: record.job_title ?? "",
      start_date: record.start_date ?? "",
      end_date: record.end_date ?? "",
      status: record.status ?? "Employed",
      verified: record.verified ?? false,
    });

    setModalOpen(true);
  }

  async function saveRecord(e: React.FormEvent) {
    e.preventDefault();

    if (!form.student_id) {
      alert("Please select a student.");
      return;
    }

    if (!form.company_name.trim()) {
      alert("Company name is required.");
      return;
    }

    if (!form.job_title.trim()) {
      alert("Job title is required.");
      return;
    }

    if (!form.start_date) {
      alert("Start date is required.");
      return;
    }

    setSaving(true);

    const payload = {
      student_id: form.student_id,
      company_name: form.company_name.trim(),
      job_title: form.job_title.trim(),
      start_date: form.start_date || null,
      end_date:
        form.status === "Employed"
          ? null
          : form.end_date || null,
      status: form.status || null,
      verified: form.verified,
    };

    try {
      if (editingRecord) {
        const { data, error } = await supabase
          .from("employment_records")
          .update(payload)
          .eq("id", editingRecord.id)
          .select(
            `
            *,
            students (
              full_name
            )
          `
          )
          .single();

        if (error) {
          alert(error.message);
          return;
        }

        setRecords((current) =>
          current.map((record) =>
            record.id === editingRecord.id ? data : record
          )
        );
      } else {
        const { data, error } = await supabase
          .from("employment_records")
          .insert(payload)
          .select(
            `
            *,
            students (
              full_name
            )
          `
          )
          .single();

        if (error) {
          alert(error.message);
          return;
        }

        setRecords((current) => [data, ...current]);
      }

      setModalOpen(false);
      setEditingRecord(null);
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(record: EmploymentRecord) {
    const confirmed = confirm(
      `Delete employment record for ${
        record.students?.full_name ?? "this student"
      }?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("employment_records")
      .delete()
      .eq("id", record.id);

    if (error) {
      alert(error.message);
      return;
    }

    setRecords((current) =>
      current.filter((item) => item.id !== record.id)
    );
  }

  const totalRecords = records.length;

  const employed = records.filter(
    (record) => record.status === "Employed"
  ).length;

  const unemployed = records.filter(
    (record) => record.status === "Unemployed"
  ).length;

  const verified = records.filter(
    (record) => record.verified
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6 lg:p-10">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center"
      >
        <div>
          <p className="text-sm font-medium text-gray-500">
            Graduate Development
          </p>

          <h1 className="mt-1 text-4xl font-black tracking-tight">
            Employment
          </h1>

          <p className="mt-2 text-gray-500">
            Track graduates from education into employment.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-2xl bg-black px-6 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
          <Plus size={19} />
          Add Employment
        </button>
      </motion.div>

      {/* STATS */}
      <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Records",
            value: totalRecords,
            icon: Briefcase,
          },
          {
            title: "Currently Employed",
            value: employed,
            icon: CheckCircle2,
          },
          {
            title: "Unemployed",
            value: unemployed,
            icon: XCircle,
          },
          {
            title: "Verified",
            value: verified,
            icon: CheckCircle2,
          },
        ].map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {stat.title}
                  </p>

                  <p className="mt-1 text-3xl font-black">
                    {stat.value}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-100 p-3">
                  <Icon size={22} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* SEARCH */}
      <div className="mb-6 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, company, job title or status..."
            className="w-full rounded-xl border bg-gray-50 py-3.5 pl-11 pr-4 outline-none transition focus:border-black focus:bg-white"
          />
        </div>
      </div>

      {/* TABLE */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="overflow-hidden rounded-2xl border bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="border-b bg-gray-50">
              <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Start</th>
                <th className="px-6 py-4">End</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredRecords.map((record, index) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group transition hover:bg-gray-50"
                >
                  {/* STUDENT */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                        <User size={18} />
                      </div>

                      <span className="font-semibold">
                        {record.students?.full_name ??
                          "Unknown"}
                      </span>
                    </div>
                  </td>

                  {/* COMPANY */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Building2
                        size={16}
                        className="text-gray-400"
                      />

                      <span className="text-sm font-medium">
                        {record.company_name || "—"}
                      </span>
                    </div>
                  </td>

                  {/* JOB */}
                  <td className="px-6 py-5 text-sm">
                    {record.job_title || "—"}
                  </td>

                  {/* START */}
                  <td className="px-6 py-5 text-sm">
                    {record.start_date || "—"}
                  </td>

                  {/* END */}
                  <td className="px-6 py-5 text-sm">
                    {record.end_date || "Current"}
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-5">
                    <StatusBadge
                      status={record.status}
                    />
                  </td>

                  {/* VERIFIED */}
                  <td className="px-6 py-5">
                    {record.verified ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                        <CheckCircle2 size={14} />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600">
                        <XCircle size={14} />
                        Not Verified
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2 opacity-70 transition group-hover:opacity-100">
                      <button
                        onClick={() =>
                          openEditModal(record)
                        }
                        className="rounded-lg p-2 hover:bg-gray-200"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        onClick={() =>
                          deleteRecord(record)
                        }
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredRecords.length === 0 && (
          <div className="px-6 py-16 text-center">
            <Briefcase
              size={40}
              className="mx-auto text-gray-300"
            />

            <p className="mt-4 font-semibold">
              No employment records found
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Add an employment record to start tracking graduates.
            </p>
          </div>
        )}

        {loading && (
          <div className="px-6 py-16 text-center text-gray-400">
            Loading employment records...
          </div>
        )}
      </motion.div>

      {/* MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              {/* HEADER */}
              <div className="flex shrink-0 items-center justify-between border-b px-6 py-5">
                <div>
                  <h2 className="text-2xl font-black">
                    {editingRecord
                      ? "Edit Employment"
                      : "Add Employment"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Record the graduate's employment information.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl p-2 transition hover:bg-gray-100"
                >
                  <X size={22} />
                </button>
              </div>

              {/* SCROLLABLE FORM */}
              <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
                <form
                  id="employment-form"
                  onSubmit={saveRecord}
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    {/* STUDENT */}
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold">
                        Student *
                      </label>

                      <select
                        value={form.student_id}
                        onChange={(e) =>
                          updateField(
                            "student_id",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
                      >
                        <option value="">
                          Select student...
                        </option>

                        {students.map((student) => (
                          <option
                            key={student.id}
                            value={student.id}
                          >
                            {student.full_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* COMPANY */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Company *
                      </label>

                      <input
                        value={form.company_name}
                        onChange={(e) =>
                          updateField(
                            "company_name",
                            e.target.value
                          )
                        }
                        placeholder="Company name"
                        className="w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
                      />
                    </div>

                    {/* JOB TITLE */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Job Title *
                      </label>

                      <input
                        value={form.job_title}
                        onChange={(e) =>
                          updateField(
                            "job_title",
                            e.target.value
                          )
                        }
                        placeholder="Software Developer"
                        className="w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
                      />
                    </div>

                    {/* START DATE */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Start Date *
                      </label>

                      <div className="relative">
                        <CalendarDays
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          type="date"
                          value={form.start_date}
                          onChange={(e) =>
                            updateField(
                              "start_date",
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border bg-white py-3 pl-11 pr-4 outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
                        />
                      </div>
                    </div>

                    {/* END DATE */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        End Date
                      </label>

                      <input
                        type="date"
                        value={form.end_date}
                        disabled={form.status === "Employed"}
                        onChange={(e) =>
                          updateField(
                            "end_date",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:border-black focus:ring-2 focus:ring-black/5 disabled:bg-gray-100 disabled:text-gray-400"
                      />

                      {form.status === "Employed" && (
                        <p className="mt-1 text-xs text-gray-400">
                          End date is not needed for current employment.
                        </p>
                      )}
                    </div>

                    {/* STATUS */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Status
                      </label>

                      <select
                        value={form.status}
                        onChange={(e) =>
                          updateField(
                            "status",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
                      >
                        <option value="Employed">
                          Employed
                        </option>

                        <option value="Unemployed">
                          Unemployed
                        </option>

                        <option value="Self-Employed">
                          Self-Employed
                        </option>

                        <option value="Internship">
                          Internship
                        </option>

                        <option value="Contract">
                          Contract
                        </option>
                      </select>
                    </div>

                    {/* VERIFICATION */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Employment Verification
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          updateField(
                            "verified",
                            !form.verified
                          )
                        }
                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition ${
                          form.verified
                            ? "border-green-200 bg-green-50"
                            : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {form.verified ? (
                            <CheckCircle2
                              size={20}
                              className="text-green-600"
                            />
                          ) : (
                            <XCircle
                              size={20}
                              className="text-gray-400"
                            />
                          )}

                          <span className="text-sm font-semibold">
                            {form.verified
                              ? "Verified"
                              : "Not Verified"}
                          </span>
                        </div>

                        <span
                          className={`h-5 w-9 rounded-full p-0.5 transition ${
                            form.verified
                              ? "bg-green-600"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`block h-4 w-4 rounded-full bg-white shadow transition ${
                              form.verified
                                ? "translate-x-4"
                                : ""
                            }`}
                          />
                        </span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* FOOTER */}
              <div className="flex shrink-0 justify-end gap-3 border-t bg-gray-50 px-6 py-4 md:px-8">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border bg-white px-6 py-3 font-semibold transition hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  form="employment-form"
                  disabled={saving}
                  className="rounded-xl bg-black px-7 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingRecord
                    ? "Update Employment"
                    : "Create Employment"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string | null;
}) {
  const styles: Record<string, string> = {
    Employed:
      "bg-green-50 text-green-700 border-green-100",

    Unemployed:
      "bg-red-50 text-red-700 border-red-100",

    "Self-Employed":
      "bg-blue-50 text-blue-700 border-blue-100",

    Internship:
      "bg-purple-50 text-purple-700 border-purple-100",

    Contract:
      "bg-yellow-50 text-yellow-700 border-yellow-100",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
        styles[status ?? ""] ??
        "bg-gray-50 text-gray-600 border-gray-100"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}