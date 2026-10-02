"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  User,
  Users,
  MapPin,
  Landmark,
  DollarSign,
  Phone,
  AlertCircle,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Student = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;

  gender: string | null;
  national_id: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  marital_status: string | null;

  tribe: string | null;
  sub_tribe: string | null;
  clan: string | null;

  father_name: string | null;
  father_phone: string | null;
  father_occupation: string | null;

  mother_name: string | null;
  mother_phone: string | null;
  mother_occupation: string | null;

  guardian_name: string | null;
  guardian_relationship: string | null;
  guardian_phone: string | null;

  family_size: number | null;
  siblings_count: number | null;
  birth_order: number | null;

  household_income: number | null;
  financial_need: string | null;

  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;

  notes: string | null;
  created_at: string;
};

type FormData = {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;

  gender: string;
  national_id: string;
  address: string;
  city: string;
  country: string;
  marital_status: string;

  tribe: string;
  sub_tribe: string;
  clan: string;

  father_name: string;
  father_phone: string;
  father_occupation: string;

  mother_name: string;
  mother_phone: string;
  mother_occupation: string;

  guardian_name: string;
  guardian_relationship: string;
  guardian_phone: string;

  family_size: string;
  siblings_count: string;
  birth_order: string;

  household_income: string;
  financial_need: string;

  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;

  notes: string;
};

const emptyForm: FormData = {
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

  family_size: "",
  siblings_count: "",
  birth_order: "",

  household_income: "",
  financial_need: "",

  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_relationship: "",

  notes: "",
};

export default function StudentsClient({
  initialStudents,
}: {
  initialStudents: Student[];
}) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [openSection, setOpenSection] = useState("personal");

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
        student.clan,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    );
  }, [students, search]);

  function updateField(field: keyof FormData, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openAddModal() {
    setEditingStudent(null);
    setForm(emptyForm);
    setOpenSection("personal");
    setModalOpen(true);
  }

  function openEditModal(student: Student) {
    setEditingStudent(student);

    setForm({
      full_name: student.full_name ?? "",
      email: student.email ?? "",
      phone: student.phone ?? "",
      date_of_birth: student.date_of_birth ?? "",

      gender: student.gender ?? "",
      national_id: student.national_id ?? "",
      address: student.address ?? "",
      city: student.city ?? "",
      country: student.country ?? "",
      marital_status: student.marital_status ?? "",

      tribe: student.tribe ?? "",
      sub_tribe: student.sub_tribe ?? "",
      clan: student.clan ?? "",

      father_name: student.father_name ?? "",
      father_phone: student.father_phone ?? "",
      father_occupation: student.father_occupation ?? "",

      mother_name: student.mother_name ?? "",
      mother_phone: student.mother_phone ?? "",
      mother_occupation: student.mother_occupation ?? "",

      guardian_name: student.guardian_name ?? "",
      guardian_relationship: student.guardian_relationship ?? "",
      guardian_phone: student.guardian_phone ?? "",

      family_size: student.family_size?.toString() ?? "",
      siblings_count: student.siblings_count?.toString() ?? "",
      birth_order: student.birth_order?.toString() ?? "",

      household_income: student.household_income?.toString() ?? "",
      financial_need: student.financial_need ?? "",

      emergency_contact_name: student.emergency_contact_name ?? "",
      emergency_contact_phone: student.emergency_contact_phone ?? "",
      emergency_contact_relationship:
        student.emergency_contact_relationship ?? "",

      notes: student.notes ?? "",
    });

    setOpenSection("personal");
    setModalOpen(true);
  }

  async function saveStudent(e: React.FormEvent) {
    e.preventDefault();

    if (!form.full_name.trim()) {
      alert("Full name is required.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

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

        family_size: form.family_size
          ? Number(form.family_size)
          : null,
        siblings_count: form.siblings_count
          ? Number(form.siblings_count)
          : null,
        birth_order: form.birth_order
          ? Number(form.birth_order)
          : null,

        household_income: form.household_income
          ? Number(form.household_income)
          : null,
        financial_need: form.financial_need || null,

        emergency_contact_name:
          form.emergency_contact_name || null,
        emergency_contact_phone:
          form.emergency_contact_phone || null,
        emergency_contact_relationship:
          form.emergency_contact_relationship || null,

        notes: form.notes || null,
      };

      if (editingStudent) {
        const { data, error } = await supabase
          .from("students")
          .update(payload)
          .eq("id", editingStudent.id)
          .select()
          .single();

        if (error) {
          alert(error.message);
          return;
        }

        setStudents((current) =>
          current.map((student) =>
            student.id === editingStudent.id ? data : student
          )
        );
      } else {
        const { data, error } = await supabase
          .from("students")
          .insert(payload)
          .select()
          .single();

        if (error) {
          alert(error.message);
          return;
        }

        setStudents((current) => [data, ...current]);
      }

      setModalOpen(false);
      setEditingStudent(null);
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  }

  async function deleteStudent(student: Student) {
    const confirmed = confirm(
      `Are you sure you want to delete ${student.full_name}?`
    );

    if (!confirmed) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", student.id);

    if (error) {
      alert(error.message);
      return;
    }

    setStudents((current) =>
      current.filter((item) => item.id !== student.id)
    );
  }

  const sections = [
    {
      id: "personal",
      title: "Personal Information",
      icon: User,
    },
    {
      id: "tribe",
      title: "Tribe & Background",
      icon: Landmark,
    },
    {
      id: "parents",
      title: "Parents & Guardian",
      icon: Users,
    },
    {
      id: "family",
      title: "Family Information",
      icon: Users,
    },
    {
      id: "financial",
      title: "Financial Information",
      icon: DollarSign,
    },
    {
      id: "emergency",
      title: "Emergency Contact",
      icon: AlertCircle,
    },
    {
      id: "notes",
      title: "Additional Notes",
      icon: GraduationCap,
    },
  ];

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
            Education Management
          </p>

          <h1 className="mt-1 text-4xl font-black tracking-tight">
            Students
          </h1>

          <p className="mt-2 text-gray-500">
            Manage student personal, family and background information.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-2xl bg-black px-6 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
          <Plus size={19} />
          Add Student
        </button>
      </motion.div>

      {/* STATS */}
      <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Students",
            value: students.length,
            icon: Users,
          },
          {
            title: "Male",
            value: students.filter((s) => s.gender === "Male").length,
            icon: User,
          },
          {
            title: "Female",
            value: students.filter((s) => s.gender === "Female").length,
            icon: User,
          },
          {
            title: "With Family Data",
            value: students.filter(
              (s) => s.father_name || s.mother_name
            ).length,
            icon: Landmark,
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
                  <p className="text-sm text-gray-500">{stat.title}</p>
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
            placeholder="Search by name, email, phone, city, tribe or clan..."
            className="w-full rounded-xl border bg-gray-50 py-3.5 pl-11 pr-4 outline-none transition focus:border-black focus:bg-white"
          />
        </div>
      </div>

      {/* STUDENTS TABLE */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="overflow-hidden rounded-2xl border bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
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

            <tbody className="divide-y">
              {filteredStudents.map((student, index) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group transition hover:bg-gray-50"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black font-bold text-white">
                        {student.full_name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <p className="font-semibold">
                          {student.full_name}
                        </p>

                        <p className="text-xs text-gray-400">
                          {student.date_of_birth || "No birth date"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <p className="text-sm">
                      {student.email || "No email"}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {student.phone || "No phone"}
                    </p>
                  </td>

                  <td className="px-6 py-5 text-sm">
                    {student.gender || "—"}
                  </td>

                  <td className="px-6 py-5 text-sm">
                    {student.city || "—"}
                  </td>

                  <td className="px-6 py-5 text-sm">
                    {student.tribe || "—"}
                  </td>

                  <td className="px-6 py-5 text-sm">
                    {student.family_size
                      ? `${student.family_size} members`
                      : "—"}
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2 opacity-70 transition group-hover:opacity-100">
                      <button
                        onClick={() => openEditModal(student)}
                        className="rounded-lg p-2 hover:bg-gray-200"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        onClick={() => deleteStudent(student)}
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

        {filteredStudents.length === 0 && (
          <div className="px-6 py-16 text-center">
            <Users
              size={40}
              className="mx-auto text-gray-300"
            />

            <p className="mt-4 font-semibold">
              No students found
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Try another search or add a new student.
            </p>
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between border-b px-6 py-5">
                <div>
                  <h2 className="text-2xl font-black">
                    {editingStudent
                      ? "Edit Student"
                      : "Add New Student"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Enter the student's complete information.
                  </p>
                </div>

                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl p-2 transition hover:bg-gray-100"
                >
                  <X size={22} />
                </button>
              </div>

              {/* FORM */}
              <form
                onSubmit={saveStudent}
                className="max-h-[calc(92vh-90px)] overflow-y-auto"
              >
                <div className="space-y-3 p-6">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const open = openSection === section.id;

                    return (
                      <div
                        key={section.id}
                        className="overflow-hidden rounded-2xl border"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenSection(
                              open ? "" : section.id
                            )
                          }
                          className="flex w-full items-center justify-between bg-gray-50 px-5 py-4 text-left transition hover:bg-gray-100"
                        >
                          <span className="flex items-center gap-3 font-bold">
                            <Icon size={19} />
                            {section.title}
                          </span>

                          <ChevronDown
                            size={19}
                            className={`transition-transform ${
                              open ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="grid gap-4 p-5 md:grid-cols-2">
                                {/* PERSONAL */}
                                {section.id === "personal" && (
                                  <>
                                    <Field
                                      label="Full Name *"
                                      value={form.full_name}
                                      onChange={(v) =>
                                        updateField(
                                          "full_name",
                                          v
                                        )
                                      }
                                    />

                                    <Field
                                      label="Email"
                                      type="email"
                                      value={form.email}
                                      onChange={(v) =>
                                        updateField(
                                          "email",
                                          v
                                        )
                                      }
                                    />

                                    <Field
                                      label="Phone"
                                      value={form.phone}
                                      onChange={(v) =>
                                        updateField(
                                          "phone",
                                          v
                                        )
                                      }
                                    />

                                    <Field
                                      label="Date of Birth"
                                      type="date"
                                      value={
                                        form.date_of_birth
                                      }
                                      onChange={(v) =>
                                        updateField(
                                          "date_of_birth",
                                          v
                                        )
                                      }
                                    />

                                    <SelectField
                                      label="Gender"
                                      value={form.gender}
                                      options={[
                                        "Male",
                                        "Female",
                                      ]}
                                      onChange={(v) =>
                                        updateField(
                                          "gender",
                                          v
                                        )
                                      }
                                    />

                                    <Field
                                      label="National ID"
                                      value={form.national_id}
                                      onChange={(v) =>
                                        updateField(
                                          "national_id",
                                          v
                                        )
                                      }
                                    />

                                    <Field
                                      label="Address"
                                      value={form.address}
                                      onChange={(v) =>
                                        updateField(
                                          "address",
                                          v
                                        )
                                      }
                                    />

                                    <Field
                                      label="City"
                                      value={form.city}
                                      onChange={(v) =>
                                        updateField(
                                          "city",
                                          v
                                        )
                                      }
                                    />

                                    <Field
                                      label="Country"
                                      value={form.country}
                                      onChange={(v) =>
                                        updateField(
                                          "country",
                                          v
                                        )
                                      }
                                    />

                                    <SelectField
                                      label="Marital Status"
                                      value={
                                        form.marital_status
                                      }
                                      options={[
                                        "Single",
                                        "Married",
                                        "Divorced",
                                        "Widowed",
                                      ]}
                                      onChange={(v) =>
                                        updateField(
                                          "marital_status",
                                          v
                                        )
                                      }
                                    />
                                  </>
                                )}

                                {/* TRIBE */}
                                {section.id === "tribe" && (
                                  <>
                                    <Field
                                      label="Tribe"
                                      value={form.tribe}
                                      onChange={(v) =>
                                        updateField(
                                          "tribe",
                                          v
                                        )
                                      }
                                    />

                                    <Field
                                      label="Sub-Tribe"
                                      value={form.sub_tribe}
                                      onChange={(v) =>
                                        updateField(
                                          "sub_tribe",
                                          v
                                        )
                                      }
                                    />

                                    <Field
                                      label="Clan"
                                      value={form.clan}
                                      onChange={(v) =>
                                        updateField(
                                          "clan",
                                          v
                                        )
                                      }
                                    />
                                  </>
                                )}

                                {/* PARENTS */}
                                {section.id === "parents" && (
                                  <>
                                    <Field
                                      label="Father Name"
                                      value={
                                        form.father_name
                                      }
                                      onChange={(v) =>
                                        updateField(
                                          "father_name",
                                          v
                                        )
                                      }
                                    />

                                    <Field
                                      label="Father Phone"
                                      value={
                                        form.father_phone
                                      }
                                      onChange={(v) =>
                                        updateField(
                                          "father_phone",
                                          v
                                        )
                                      }
                                    />

                                    <Field
                                      label="Father Occupation"
                                      value={
                                        form.father_occupation
                                      }
                                      onChange={(v) =>
                                        updateField(
                                          "father_occupation",
                                          v
                                        )
                                      }
                                    />

                                    <Field
                                      label="Mother Name"
                                      value={
                                        form.mother_name
                                      }
                                      onChange={(v) =>
                                        updateField(
                                          "mother_name",
                                          v
                                        )
                                      }
                                    />

                                    <Field
                                      label="Mother Phone"
                                      value={
                                        form.mother_phone
                                      }
                                      onChange={(v) =>
                                        updateField(
                                          "mother_phone",
                                          v
                                        )
                                      }
                                    />

                                    <Field
                                      label="Mother Occupation"
                                      value={
                                        form.mother_occupation
                                      }
                                      onChange={(v) =>
                                        updateField(
                                          "mother_occupation",
                                          v
                                        )
                                      }
                                    />

                                    <Field
                                      label="Guardian Name"
                                      value={
                                        form.guardian_name
                                      }
                                      onChange={(v) =>
                                        updateField(
                                          "guardian_name",
                                          v
                                        )
                                      }
                                    />

                                    <Field
                                      label="Guardian Relationship"
                                      value={
                                        form.guardian_relationship
                                      }
                                      onChange={(v) =>
                                        updateField(
                                          "guardian_relationship",
                                          v
                                        )
                                      }
                                    />

                                    <Field
                                      label="Guardian Phone"
                                      value={
                                        form.guardian_phone
                                      }
                                      onChange={(v) =>
                                        updateField(
                                          "guardian_phone",
                                          v
                                        )
                                      }
                                    />
                                  </>
                                )}

                                {/* FAMILY */}
                                {section.id === "family" && (
                                  <>
                                    <NumberField
                                      label="Family Size"
                                      value={
                                        form.family_size
                                      }
                                      onChange={(v) =>
                                        updateField(
                                          "family_size",
                                          v
                                        )
                                      }
                                    />

                                    <NumberField
                                      label="Number of Siblings"
                                      value={
                                        form.siblings_count
                                      }
                                      onChange={(v) =>
                                        updateField(
                                          "siblings_count",
                                          v
                                        )
                                      }
                                    />

                                    <NumberField
                                      label="Birth Order"
                                      value={
                                        form.birth_order
                                      }
                                      onChange={(v) =>
                                        updateField(
                                          "birth_order",
                                          v
                                        )
                                      }
                                    />
                                  </>
                                )}

                                {/* FINANCIAL */}
                                {section.id === "financial" && (
                                  <>
                                    <NumberField
                                      label="Household Monthly Income"
                                      value={
                                        form.household_income
                                      }
                                      onChange={(v) =>
                                        updateField(
                                          "household_income",
                                          v
                                        )
                                      }
                                    />

                                    <SelectField
                                      label="Financial Need"
                                      value={
                                        form.financial_need
                                      }
                                      options={[
                                        "Low",
                                        "Medium",
                                        "High",
                                        "Critical",
                                      ]}
                                      onChange={(v) =>
                                        updateField(
                                          "financial_need",
                                          v
                                        )
                                      }
                                    />
                                  </>
                                )}

                                {/* EMERGENCY */}
                                {section.id === "emergency" && (
                                  <>
                                    <Field
                                      label="Contact Name"
                                      value={
                                        form.emergency_contact_name
                                      }
                                      onChange={(v) =>
                                        updateField(
                                          "emergency_contact_name",
                                          v
                                        )
                                      }
                                    />

                                    <Field
                                      label="Contact Phone"
                                      value={
                                        form.emergency_contact_phone
                                      }
                                      onChange={(v) =>
                                        updateField(
                                          "emergency_contact_phone",
                                          v
                                        )
                                      }
                                    />

                                    <Field
                                      label="Relationship"
                                      value={
                                        form.emergency_contact_relationship
                                      }
                                      onChange={(v) =>
                                        updateField(
                                          "emergency_contact_relationship",
                                          v
                                        )
                                      }
                                    />
                                  </>
                                )}

                                {/* NOTES */}
                                {section.id === "notes" && (
                                  <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-semibold">
                                      Notes
                                    </label>

                                    <textarea
                                      value={form.notes}
                                      onChange={(e) =>
                                        updateField(
                                          "notes",
                                          e.target.value
                                        )
                                      }
                                      rows={5}
                                      placeholder="Additional information about the student..."
                                      className="w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:border-black"
                                    />
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* FOOTER */}
                <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl border px-6 py-3 font-semibold transition hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-black px-7 py-3 font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingStudent
                      ? "Update Student"
                      : "Create Student"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field
      label={label}
      type="number"
      value={value}
      onChange={onChange}
    />
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
      >
        <option value="">Select...</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}