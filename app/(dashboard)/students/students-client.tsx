"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronDown,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Student = {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  national_id?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  marital_status?: string | null;
  tribe?: string | null;
  sub_tribe?: string | null;
  clan?: string | null;
  father_name?: string | null;
  father_phone?: string | null;
  father_occupation?: string | null;
  mother_name?: string | null;
  mother_phone?: string | null;
  mother_occupation?: string | null;
  guardian_name?: string | null;
  guardian_relationship?: string | null;
  guardian_phone?: string | null;
  family_size?: number | null;
  siblings_count?: number | null;
  birth_order?: number | null;
  household_income?: number | null;
  financial_need?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relationship?: string | null;
  notes?: string | null;
  photo_url?: string | null;
};

type Props = {
  initialStudents: Student[];
};

const emptyStudent: Student = {
  id: "",
  full_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  gender: "",
  national_id: "",
  address: "",
  city: "",
  country: "",
  marital_status: "",
  tribe: "",
  sub_tribe: "",
  clan: "",
  father_name: "",
  father_phone: "",
  father_occupation: "",
  mother_name: "",
  mother_phone: "",
  mother_occupation: "",
  guardian_name: "",
  guardian_relationship: "",
  guardian_phone: "",
  family_size: null,
  siblings_count: null,
  birth_order: null,
  household_income: null,
  financial_need: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_relationship: "",
  notes: "",
  photo_url: "",
};

export default function StudentsClient({ initialStudents }: Props) {
  const supabase = createClient();

  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<Student>(emptyStudent);
  const [loading, setLoading] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("personal");

  const filteredStudents = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return students;

    return students.filter((student) =>
      [
        student.full_name,
        student.email,
        student.phone,
        student.city,
        student.tribe,
        student.sub_tribe,
        student.clan,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [students, search]);

  function openAddModal() {
    setEditingStudent(null);
    setForm(emptyStudent);
    setOpenSection("personal");
    setShowModal(true);
  }

  function openEditModal(student: Student) {
    setEditingStudent(student);
    setForm({
      ...emptyStudent,
      ...student,
    });
    setOpenSection("personal");
    setShowModal(true);
  }

  function closeModal() {
    if (loading) return;

    setShowModal(false);
    setEditingStudent(null);
    setForm(emptyStudent);
  }

  function updateField<K extends keyof Student>(
    field: K,
    value: Student[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function saveStudent(e: React.FormEvent) {
    e.preventDefault();

    if (!form.full_name.trim()) {
      alert("Full name is required.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email || null,
        phone: form.phone || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        national_id: form.national_id || null,
        address: form.address || null,
        city: form.city || null,
        country: form.country || null,
        marital_status: form.marital_status || null,
        tribe: form.tribe || null,
        sub_tribe: form.sub_tribe || null,
        clan: form.clan || null,
        father_name: form.father_name || null,
        father_phone: form.father_phone || null,
        father_occupation: form.father_occupation || null,
        mother_name: form.mother_name || null,
        mother_phone: form.mother_phone || null,
        mother_occupation: form.mother_occupation || null,
        guardian_name: form.guardian_name || null,
        guardian_relationship: form.guardian_relationship || null,
        guardian_phone: form.guardian_phone || null,
        family_size: form.family_size || null,
        siblings_count: form.siblings_count || null,
        birth_order: form.birth_order || null,
        household_income: form.household_income || null,
        financial_need: form.financial_need || null,
        emergency_contact_name: form.emergency_contact_name || null,
        emergency_contact_phone: form.emergency_contact_phone || null,
        emergency_contact_relationship:
          form.emergency_contact_relationship || null,
        notes: form.notes || null,
        photo_url: form.photo_url || null,
      };

      if (editingStudent) {
        const { data, error } = await supabase
          .from("students")
          .update(payload)
          .eq("id", editingStudent.id)
          .select()
          .single();

        if (error) throw error;

        setStudents((prev) =>
          prev.map((student) =>
            student.id === editingStudent.id ? data : student
          )
        );
      } else {
        const { data, error } = await supabase
          .from("students")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;

        setStudents((prev) => [data, ...prev]);
      }

      closeModal();
    } catch (error: any) {
      alert(error?.message || "Failed to save student.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteStudent(student: Student) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.full_name}?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", student.id);

    if (error) {
      alert(error.message);
      return;
    }

    setStudents((prev) =>
      prev.filter((item) => item.id !== student.id)
    );
  }

  function toggleSection(section: string) {
    setOpenSection((prev) => (prev === section ? null : section));
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-black";

  const labelClass =
    "mb-2 block text-sm font-medium text-gray-700";

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Students
            </h1>
            <p className="mt-1 text-gray-500">
              Manage student information and family details.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            <Plus size={19} />
            Add Student
          </button>
        </div>

        {/* STATS */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Students</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {students.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Showing</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {filteredStudents.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Families</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {students.filter((student) => student.family_size).length}
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-6 rounded-2xl border bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-gray-900 outline-none focus:border-black"
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
            <table className="w-full min-w-[900px] text-gray-900">
              <thead className="border-b bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4">City</th>
                  <th className="px-6 py-4">Tribe</th>
                  <th className="px-6 py-4">Family</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student, index) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group text-gray-900 transition hover:bg-gray-50"
                  >
                    {/* STUDENT */}
                    <td className="px-6 py-5 text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black font-bold text-white">
                          {student.full_name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-900">
                            {student.full_name}
                          </p>

                          <p className="text-xs text-gray-400">
                            {student.date_of_birth ||
                              "No birth date"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CONTACT */}
                    <td className="px-6 py-5 text-gray-900">
                      <p className="text-sm text-gray-900">
                        {student.email || "No email"}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {student.phone || "No phone"}
                      </p>
                    </td>

                    {/* GENDER */}
                    <td className="px-6 py-5 text-sm text-gray-900">
                      {student.gender || "—"}
                    </td>

                    {/* CITY */}
                    <td className="px-6 py-5 text-sm text-gray-900">
                      {student.city || "—"}
                    </td>

                    {/* TRIBE */}
                    <td className="px-6 py-5 text-sm text-gray-900">
                      {student.tribe || "—"}
                    </td>

                    {/* FAMILY */}
                    <td className="px-6 py-5 text-sm text-gray-900">
                      {student.family_size
                        ? `${student.family_size} members`
                        : "—"}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-5 text-gray-900">
                      <div className="flex justify-end gap-2 opacity-70 transition group-hover:opacity-100">
                        <button
                          onClick={() => openEditModal(student)}
                          className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-200 hover:text-black"
                          title="Edit"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => deleteStudent(student)}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                          title="Delete"
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

          {filteredStudents.length === 0 && (
            <div className="p-12 text-center">
              <p className="font-medium text-gray-900">
                No students found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Try another search or add a new student.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingStudent
                    ? "Edit Student"
                    : "Add Student"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the student's information below.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveStudent} className="p-6">
              {/* PERSONAL */}
              <div className="border-b">
                <button
                  type="button"
                  onClick={() => toggleSection("personal")}
                  className="flex w-full items-center justify-between py-5 text-left"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Personal Information
                    </h3>
                    <p className="text-sm text-gray-500">
                      Basic student details
                    </p>
                  </div>

                  <ChevronDown
                    size={20}
                    className={`transition ${
                      openSection === "personal"
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {openSection === "personal" && (
                  <div className="grid gap-5 pb-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className={labelClass}>
                        Full Name *
                      </label>
                      <input
                        value={form.full_name}
                        onChange={(e) =>
                          updateField(
                            "full_name",
                            e.target.value
                          )
                        }
                        required
                        className={inputClass}
                        placeholder="Full name"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={form.email || ""}
                        onChange={(e) =>
                          updateField(
                            "email",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Email address"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Phone
                      </label>
                      <input
                        value={form.phone || ""}
                        onChange={(e) =>
                          updateField(
                            "phone",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Phone number"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={form.date_of_birth || ""}
                        onChange={(e) =>
                          updateField(
                            "date_of_birth",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Gender
                      </label>
                      <select
                        value={form.gender || ""}
                        onChange={(e) =>
                          updateField(
                            "gender",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>
                        National ID
                      </label>
                      <input
                        value={form.national_id || ""}
                        onChange={(e) =>
                          updateField(
                            "national_id",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="National ID"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Marital Status
                      </label>
                      <select
                        value={form.marital_status || ""}
                        onChange={(e) =>
                          updateField(
                            "marital_status",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      >
                        <option value="">Select status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelClass}>
                        Address
                      </label>
                      <input
                        value={form.address || ""}
                        onChange={(e) =>
                          updateField(
                            "address",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Address"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        City
                      </label>
                      <input
                        value={form.city || ""}
                        onChange={(e) =>
                          updateField(
                            "city",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Country
                      </label>
                      <input
                        value={form.country || ""}
                        onChange={(e) =>
                          updateField(
                            "country",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Country"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Tribe
                      </label>
                      <input
                        value={form.tribe || ""}
                        onChange={(e) =>
                          updateField(
                            "tribe",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Tribe"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Sub-Tribe
                      </label>
                      <input
                        value={form.sub_tribe || ""}
                        onChange={(e) =>
                          updateField(
                            "sub_tribe",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Sub-tribe"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Clan
                      </label>
                      <input
                        value={form.clan || ""}
                        onChange={(e) =>
                          updateField(
                            "clan",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Clan"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* FAMILY */}
              <div className="border-b">
                <button
                  type="button"
                  onClick={() => toggleSection("family")}
                  className="flex w-full items-center justify-between py-5 text-left"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Family Information
                    </h3>
                    <p className="text-sm text-gray-500">
                      Parents, guardian and household
                    </p>
                  </div>

                  <ChevronDown
                    size={20}
                    className={`transition ${
                      openSection === "family"
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {openSection === "family" && (
                  <div className="grid gap-5 pb-6 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>
                        Father Name
                      </label>
                      <input
                        value={form.father_name || ""}
                        onChange={(e) =>
                          updateField(
                            "father_name",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Father name"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Father Phone
                      </label>
                      <input
                        value={form.father_phone || ""}
                        onChange={(e) =>
                          updateField(
                            "father_phone",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Father phone"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Father Occupation
                      </label>
                      <input
                        value={form.father_occupation || ""}
                        onChange={(e) =>
                          updateField(
                            "father_occupation",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Father occupation"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Mother Name
                      </label>
                      <input
                        value={form.mother_name || ""}
                        onChange={(e) =>
                          updateField(
                            "mother_name",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Mother name"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Mother Phone
                      </label>
                      <input
                        value={form.mother_phone || ""}
                        onChange={(e) =>
                          updateField(
                            "mother_phone",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Mother phone"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Mother Occupation
                      </label>
                      <input
                        value={form.mother_occupation || ""}
                        onChange={(e) =>
                          updateField(
                            "mother_occupation",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Mother occupation"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Guardian Name
                      </label>
                      <input
                        value={form.guardian_name || ""}
                        onChange={(e) =>
                          updateField(
                            "guardian_name",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Guardian name"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Guardian Relationship
                      </label>
                      <input
                        value={
                          form.guardian_relationship || ""
                        }
                        onChange={(e) =>
                          updateField(
                            "guardian_relationship",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Relationship"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Guardian Phone
                      </label>
                      <input
                        value={form.guardian_phone || ""}
                        onChange={(e) =>
                          updateField(
                            "guardian_phone",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Guardian phone"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Family Size
                      </label>
                      <input
                        type="number"
                        value={form.family_size ?? ""}
                        onChange={(e) =>
                          updateField(
                            "family_size",
                            e.target.value
                              ? Number(e.target.value)
                              : null
                          )
                        }
                        className={inputClass}
                        placeholder="Family size"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Siblings Count
                      </label>
                      <input
                        type="number"
                        value={form.siblings_count ?? ""}
                        onChange={(e) =>
                          updateField(
                            "siblings_count",
                            e.target.value
                              ? Number(e.target.value)
                              : null
                          )
                        }
                        className={inputClass}
                        placeholder="Number of siblings"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Birth Order
                      </label>
                      <input
                        type="number"
                        value={form.birth_order ?? ""}
                        onChange={(e) =>
                          updateField(
                            "birth_order",
                            e.target.value
                              ? Number(e.target.value)
                              : null
                          )
                        }
                        className={inputClass}
                        placeholder="Birth order"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* FINANCIAL */}
              <div className="border-b">
                <button
                  type="button"
                  onClick={() => toggleSection("financial")}
                  className="flex w-full items-center justify-between py-5 text-left"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Financial Information
                    </h3>
                    <p className="text-sm text-gray-500">
                      Household income and financial need
                    </p>
                  </div>

                  <ChevronDown
                    size={20}
                    className={`transition ${
                      openSection === "financial"
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {openSection === "financial" && (
                  <div className="grid gap-5 pb-6 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>
                        Household Income
                      </label>
                      <input
                        type="number"
                        value={form.household_income ?? ""}
                        onChange={(e) =>
                          updateField(
                            "household_income",
                            e.target.value
                              ? Number(e.target.value)
                              : null
                          )
                        }
                        className={inputClass}
                        placeholder="Monthly income"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Financial Need
                      </label>
                      <select
                        value={form.financial_need || ""}
                        onChange={(e) =>
                          updateField(
                            "financial_need",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      >
                        <option value="">
                          Select level
                        </option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">
                          Critical
                        </option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* EMERGENCY */}
              <div className="border-b">
                <button
                  type="button"
                  onClick={() => toggleSection("emergency")}
                  className="flex w-full items-center justify-between py-5 text-left"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Emergency Contact
                    </h3>
                    <p className="text-sm text-gray-500">
                      Emergency contact details
                    </p>
                  </div>

                  <ChevronDown
                    size={20}
                    className={`transition ${
                      openSection === "emergency"
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {openSection === "emergency" && (
                  <div className="grid gap-5 pb-6 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>
                        Contact Name
                      </label>
                      <input
                        value={
                          form.emergency_contact_name || ""
                        }
                        onChange={(e) =>
                          updateField(
                            "emergency_contact_name",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Emergency contact"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Contact Phone
                      </label>
                      <input
                        value={
                          form.emergency_contact_phone || ""
                        }
                        onChange={(e) =>
                          updateField(
                            "emergency_contact_phone",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Emergency phone"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Relationship
                      </label>
                      <input
                        value={
                          form.emergency_contact_relationship ||
                          ""
                        }
                        onChange={(e) =>
                          updateField(
                            "emergency_contact_relationship",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Relationship"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelClass}>
                        Notes
                      </label>
                      <textarea
                        value={form.notes || ""}
                        onChange={(e) =>
                          updateField(
                            "notes",
                            e.target.value
                          )
                        }
                        rows={4}
                        className={inputClass}
                        placeholder="Additional notes"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="rounded-xl border px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : editingStudent
                    ? "Update Student"
                    : "Add Student"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}