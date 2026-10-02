"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Award,
  CalendarDays,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

type GraduationRecord = {
  id: string;
  student_id: string;
  institution: string;
  program: string | null;
  level: string | null;
  graduation_date: string | null;
  certificate_name: string | null;
  certificate_number: string | null;
  graduation_notes: string | null;
  status: string | null;
  student?: {
    full_name: string;
  };
};

type Student = {
  id: string;
  full_name: string;
};

const emptyForm = {
  student_id: "",
  institution: "",
  program: "",
  level: "Bachelor",
  graduation_date: "",
  certificate_name: "",
  certificate_number: "",
  graduation_notes: "",
};

export default function GraduationPage() {
  const supabase = createClient();

  const [records, setRecords] = useState<GraduationRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<GraduationRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);

    const { data: studentData } = await supabase
      .from("students")
      .select("id, full_name")
      .order("full_name");

    const { data: graduationData } = await supabase
      .from("education_records")
      .select(`
        *,
        student:students (
          full_name
        )
      `)
      .eq("status", "Graduated")
      .order("graduation_date", { ascending: false });

    setStudents(studentData ?? []);
    setRecords(graduationData ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredRecords = useMemo(() => {
    const value = search.toLowerCase();

    return records.filter((record) => {
      return (
        record.student?.full_name?.toLowerCase().includes(value) ||
        record.institution?.toLowerCase().includes(value) ||
        record.program?.toLowerCase().includes(value) ||
        record.certificate_name?.toLowerCase().includes(value)
      );
    });
  }, [records, search]);

  const stats = {
    total: records.length,
    thisYear: records.filter(
      (r) =>
        r.graduation_date &&
        new Date(r.graduation_date).getFullYear() === new Date().getFullYear()
    ).length,
    certificates: records.filter((r) => r.certificate_name).length,
  };

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(record: GraduationRecord) {
    setEditing(record);

    setForm({
      student_id: record.student_id,
      institution: record.institution ?? "",
      program: record.program ?? "",
      level: record.level ?? "Bachelor",
      graduation_date: record.graduation_date ?? "",
      certificate_name: record.certificate_name ?? "",
      certificate_number: record.certificate_number ?? "",
      graduation_notes: record.graduation_notes ?? "",
    });

    setShowModal(true);
  }

  async function saveGraduation() {
    if (!form.student_id || !form.institution || !form.graduation_date) {
      alert("Please fill Student, Institution and Graduation Date.");
      return;
    }

    const payload = {
      student_id: form.student_id,
      institution: form.institution,
      program: form.program || null,
      level: form.level || null,
      graduation_date: form.graduation_date,
      certificate_name: form.certificate_name || null,
      certificate_number: form.certificate_number || null,
      graduation_notes: form.graduation_notes || null,
      status: "Graduated",
    };

    if (editing) {
      const { error } = await supabase
        .from("education_records")
        .update(payload)
        .eq("id", editing.id);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from("education_records")
        .insert(payload);

      if (error) {
        alert(error.message);
        return;
      }
    }

    setShowModal(false);
    setForm(emptyForm);
    setEditing(null);
    loadData();
  }

  async function deleteGraduation(id: string) {
    const confirmed = confirm(
      "Are you sure you want to delete this graduation record?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("education_records")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadData();
  }

  return (
    <div className="min-h-screen p-6 lg:p-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center"
      >
        <div>
          <p className="mb-2 text-sm font-medium text-gray-500">
            Education Management
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Graduation
          </h1>

          <p className="mt-2 text-gray-500">
            Track students who have successfully completed their education.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-medium text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
        >
          <Plus size={19} />
          Add Graduation
        </button>
      </motion.div>

      {/* Stats */}
      <div className="mb-8 grid gap-5 md:grid-cols-3">
        {[
          {
            title: "Total Graduates",
            value: stats.total,
            icon: GraduationCap,
          },
          {
            title: "Graduated This Year",
            value: stats.thisYear,
            icon: CalendarDays,
          },
          {
            title: "Certificates",
            value: stats.certificates,
            icon: Award,
          },
        ].map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-gray-100 p-3">
                  <Icon size={22} />
                </div>

                <CheckCircle2 className="text-green-500" size={20} />
              </div>

              <p className="text-sm text-gray-500">{item.title}</p>

              <p className="mt-1 text-3xl font-bold">{item.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-6 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search graduate, institution, program or certificate..."
            className="w-full rounded-xl border bg-gray-50 py-3 pl-11 pr-4 outline-none transition focus:border-black focus:bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Graduate
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Institution
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Program
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Level
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Graduation Date
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Certificate
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence>
                {filteredRecords.map((record) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                          <GraduationCap size={18} />
                        </div>

                        <div>
                          <p className="font-semibold">
                            {record.student?.full_name}
                          </p>

                          <p className="text-xs text-gray-400">
                            Graduate
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm">
                      {record.institution}
                    </td>

                    <td className="px-6 py-5 text-sm">
                      {record.program || "—"}
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium">
                        {record.level || "—"}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm">
                      {record.graduation_date
                        ? new Date(
                            record.graduation_date
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-6 py-5 text-sm">
                      {record.certificate_name || "—"}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(record)}
                          className="rounded-lg p-2 transition hover:bg-gray-100"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => deleteGraduation(record.id)}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {!loading && filteredRecords.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 rounded-2xl bg-gray-100 p-5">
              <GraduationCap size={35} />
            </div>

            <h3 className="text-lg font-bold">
              No graduation records
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Add your first graduate to start tracking graduation.
            </p>
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8"
            >
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {editing ? "Edit Graduation" : "Add Graduation"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Record the student's graduation information.
                  </p>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-xl p-2 transition hover:bg-gray-100"
                >
                  <X />
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {/* Student */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Student *
                  </label>

                  <select
                    value={form.student_id}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        student_id: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border p-3 outline-none focus:border-black"
                  >
                    <option value="">Select student</option>

                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Institution */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Institution *
                  </label>

                  <input
                    value={form.institution}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        institution: e.target.value,
                      })
                    }
                    placeholder="University / College"
                    className="w-full rounded-xl border p-3 outline-none focus:border-black"
                  />
                </div>

                {/* Program */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Program / Course
                  </label>

                  <input
                    value={form.program}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        program: e.target.value,
                      })
                    }
                    placeholder="Computer Science"
                    className="w-full rounded-xl border p-3 outline-none focus:border-black"
                  />
                </div>

                {/* Level */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Education Level
                  </label>

                  <select
                    value={form.level}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        level: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border p-3 outline-none focus:border-black"
                  >
                    <option>Bachelor</option>
                    <option>Master</option>
                    <option>PhD</option>
                    <option>Diploma</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* Graduation Date */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Graduation Date *
                  </label>

                  <input
                    type="date"
                    value={form.graduation_date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        graduation_date: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border p-3 outline-none focus:border-black"
                  />
                </div>

                {/* Certificate */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Certificate Name
                  </label>

                  <input
                    value={form.certificate_name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        certificate_name: e.target.value,
                      })
                    }
                    placeholder="Bachelor Degree Certificate"
                    className="w-full rounded-xl border p-3 outline-none focus:border-black"
                  />
                </div>

                {/* Certificate Number */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Certificate Number
                  </label>

                  <input
                    value={form.certificate_number}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        certificate_number: e.target.value,
                      })
                    }
                    placeholder="CERT-2026-001"
                    className="w-full rounded-xl border p-3 outline-none focus:border-black"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Graduation Notes
                  </label>

                  <textarea
                    value={form.graduation_notes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        graduation_notes: e.target.value,
                      })
                    }
                    rows={4}
                    placeholder="Additional graduation information..."
                    className="w-full resize-none rounded-xl border p-3 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border px-5 py-3 font-medium transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={saveGraduation}
                  className="rounded-xl bg-black px-6 py-3 font-medium text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  {editing ? "Save Changes" : "Add Graduation"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}