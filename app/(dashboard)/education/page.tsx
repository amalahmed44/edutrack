"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
Plus,
Search,
Pencil,
Trash2,
X,
BookOpen,
GraduationCap,
CalendarDays,
Building2,
User,
Users,
DollarSign,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Student = {
id: string;
full_name: string;
};

type Sponsor = {
id?: string;
education_record_id?: string;
sponsor_name: string;
amount: string;
};

type EducationRecord = {
id: string;
student_id: string;
institution: string;
program: string | null;
level: string | null;
start_date: string | null;
end_date: string | null;
status: string | null;

university_fee: number | null;
amount_paid: number | null;
remaining_balance: number | null;

graduation_date: string | null;
certificate_name: string | null;
certificate_number: string | null;
graduation_notes: string | null;

created_at: string;

students?: {
full_name: string;
} | null;
};

type FormData = {
student_id: string;
institution: string;
program: string;
level: string;
start_date: string;
end_date: string;
status: string;

university_fee: string;
amount_paid: string;

graduation_date: string;
certificate_name: string;
certificate_number: string;
graduation_notes: string;
};

const emptyForm: FormData = {
student_id: "",
institution: "",
program: "",
level: "",
start_date: "",
end_date: "",
status: "Studying",

university_fee: "",
amount_paid: "",

graduation_date: "",
certificate_name: "",
certificate_number: "",
graduation_notes: "",
};

export default function EducationPage() {
const supabase = createClient();

const [students, setStudents] = useState<Student[]>([]);
const [records, setRecords] = useState<EducationRecord[]>([]);
const [sponsors, setSponsors] = useState<Sponsor[]>([]);

const [search, setSearch] = useState("");
const [modalOpen, setModalOpen] = useState(false);
const [editingRecord, setEditingRecord] =
useState<EducationRecord | null>(null);

const [form, setForm] = useState<FormData>(emptyForm);
const [saving, setSaving] = useState(false);
const [loading, setLoading] = useState(true);
const [loadingSponsors, setLoadingSponsors] = useState(false);

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
    .from("education_records")
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

async function loadSponsors(educationRecordId: string) {
setLoadingSponsors(true);


const { data, error } = await supabase
  .from("education_sponsors")
  .select("*")
  .eq("education_record_id", educationRecordId)
  .order("created_at", { ascending: true });

if (error) {
  alert(error.message);
  setSponsors([]);
} else {
  setSponsors(
    (data ?? []).map((sponsor) => ({
      id: sponsor.id,
      education_record_id: sponsor.education_record_id,
      sponsor_name: sponsor.sponsor_name,
      amount: String(sponsor.amount ?? ""),
    }))
  );
}

setLoadingSponsors(false);

}

const filteredRecords = useMemo(() => {
const query = search.toLowerCase().trim();


if (!query) return records;

return records.filter((record) =>
  [
    record.students?.full_name,
    record.institution,
    record.program,
    record.level,
    record.status,
    record.certificate_name,
    record.certificate_number,
  ]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(query))
);


}, [records, search]);

function updateField(field: keyof FormData, value: string) {
setForm((current) => ({
...current,
[field]: value,
}));
}

function openAddModal() {
setEditingRecord(null);
setForm(emptyForm);
setSponsors([]);
setModalOpen(true);
}

async function openEditModal(record: EducationRecord) {
setEditingRecord(record);

setForm({
  student_id: record.student_id,
  institution: record.institution,
  program: record.program ?? "",
  level: record.level ?? "",
  start_date: record.start_date ?? "",
  end_date: record.end_date ?? "",
  status: record.status ?? "Studying",

  university_fee:
    record.university_fee !== null
      ? String(record.university_fee)
      : "",

  amount_paid:
    record.amount_paid !== null
      ? String(record.amount_paid)
      : "",

  graduation_date: record.graduation_date ?? "",
  certificate_name: record.certificate_name ?? "",
  certificate_number: record.certificate_number ?? "",
  graduation_notes: record.graduation_notes ?? "",
});

setSponsors([]);
setModalOpen(true);

await loadSponsors(record.id);

}

function handleStatusChange(value: string) {
setForm((current) => ({
...current,
status: value,

  ...(value !== "Graduated"
    ? {
        graduation_date: "",
        certificate_name: "",
        certificate_number: "",
        graduation_notes: "",
      }
    : {}),
}));


}

function addSponsor() {
setSponsors((current) => [
...current,
{
sponsor_name: "",
amount: "",
},
]);
}

function updateSponsor(
index: number,
field: "sponsor_name" | "amount",
value: string
) {
setSponsors((current) =>
current.map((sponsor, i) =>
i === index
? {
...sponsor,
[field]: value,
}
: sponsor
)
);
}

function removeSponsor(index: number) {
setSponsors((current) =>
current.filter((_, i) => i !== index)
);
}

const universityFee = Number(form.university_fee) || 0;
const amountPaid = Number(form.amount_paid) || 0;

const remainingBalance = Math.max(
universityFee - amountPaid,
0
);

const totalSponsorAmount = sponsors.reduce(
(total, sponsor) =>
total + (Number(sponsor.amount) || 0),
0
);

async function saveRecord(e: React.FormEvent) {
e.preventDefault();


if (!form.student_id) {
  alert("Please select a student.");
  return;
}

if (!form.institution.trim()) {
  alert("Institution is required.");
  return;
}

if (
  form.status === "Graduated" &&
  !form.graduation_date
) {
  alert("Graduation date is required.");
  return;
}

for (const sponsor of sponsors) {
  if (!sponsor.sponsor_name.trim()) {
    alert("Please enter a name for every sponsor.");
    return;
  }

  if (!sponsor.amount || Number(sponsor.amount) <= 0) {
    alert("Every sponsor must have a valid amount.");
    return;
  }
}

setSaving(true);

const payload = {
  student_id: form.student_id,
  institution: form.institution.trim(),
  program: form.program || null,
  level: form.level || null,
  start_date: form.start_date || null,
  end_date: form.end_date || null,
  status: form.status || null,

  university_fee: universityFee,
  amount_paid: amountPaid,
  remaining_balance: remainingBalance,

  graduation_date:
    form.status === "Graduated"
      ? form.graduation_date || null
      : null,

  certificate_name:
    form.status === "Graduated"
      ? form.certificate_name || null
      : null,

  certificate_number:
    form.status === "Graduated"
      ? form.certificate_number || null
      : null,

  graduation_notes:
    form.status === "Graduated"
      ? form.graduation_notes || null
      : null,
};

try {
  let educationId = editingRecord?.id;

  if (editingRecord) {
    const { data, error } = await supabase
      .from("education_records")
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

    educationId = data.id;

    setRecords((current) =>
      current.map((record) =>
        record.id === editingRecord.id ? data : record
      )
    );

    const { error: deleteSponsorsError } = await supabase
      .from("education_sponsors")
      .delete()
      .eq("education_record_id", editingRecord.id);

    if (deleteSponsorsError) {
      alert(deleteSponsorsError.message);
      return;
    }
  } else {
    const { data, error } = await supabase
      .from("education_records")
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

    educationId = data.id;

    setRecords((current) => [data, ...current]);
  }

  if (sponsors.length > 0 && educationId) {
    const sponsorPayload = sponsors.map((sponsor) => ({
      education_record_id: educationId,
      sponsor_name: sponsor.sponsor_name.trim(),
      amount: Number(sponsor.amount),
    }));

    const { error: sponsorError } = await supabase
      .from("education_sponsors")
      .insert(sponsorPayload);

    if (sponsorError) {
      alert(sponsorError.message);
      return;
    }
  }

  setModalOpen(false);
  setEditingRecord(null);
  setForm(emptyForm);
  setSponsors([]);
} finally {
  setSaving(false);
}

}

async function deleteRecord(record: EducationRecord) {
const confirmed = confirm(
`Delete education record for ${
        record.students?.full_name ?? "this student"
      }?`
);

if (!confirmed) return;

const { error } = await supabase
  .from("education_records")
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

const studying = records.filter(
(r) => r.status === "Studying"
).length;

const graduated = records.filter(
(r) => r.status === "Graduated"
).length;

const paused = records.filter(
(r) => r.status === "Paused"
).length;

return  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6 text-gray-900 lg:p-10">
<motion.div
initial={{ opacity: 0, y: -20 }}
animate={{ opacity: 1, y: 0 }}
className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center"
> <div> <p className="text-sm font-medium text-gray-500">
Student Development </p>

      <h1 className="mt-1 text-4xl font-black tracking-tight text-gray-900">
        Education
      </h1>

      <p className="mt-2 text-gray-500">
        Track education, university fees, sponsors and graduation.
      </p>
    </div>

    <button
      onClick={openAddModal}
      className="flex items-center justify-center gap-2 rounded-2xl bg-black px-6 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <Plus size={19} />
      Add Education
    </button>
  </motion.div>

  <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {[
      {
        title: "Total Records",
        value: totalRecords,
        icon: BookOpen,
      },
      {
        title: "Currently Studying",
        value: studying,
        icon: GraduationCap,
      },
      {
        title: "Graduated",
        value: graduated,
        icon: GraduationCap,
      },
      {
        title: "Paused",
        value: paused,
        icon: CalendarDays,
      },
    ].map((stat, index) => {
      const Icon = stat.icon;

      return (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          className="rounded-2xl border bg-white p-5 text-gray-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {stat.title}
              </p>

              <p className="mt-1 text-3xl font-black text-gray-900">
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

  <div className="mb-6 rounded-2xl border bg-white p-4 text-gray-900 shadow-sm">
    <div className="relative">
      <Search
        size={19}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search student, institution, program or status..."
        className="w-full rounded-xl border bg-gray-50 py-3.5 pl-11 pr-4 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white"
      />
    </div>
  </div>

  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="overflow-hidden rounded-2xl border bg-white text-gray-900 shadow-sm"
  >
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1250px] text-gray-900">
        <thead className="border-b bg-gray-50">
          <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
            <th className="px-6 py-4">Student</th>
            <th className="px-6 py-4">Institution</th>
            <th className="px-6 py-4">Program</th>
            <th className="px-6 py-4">Level</th>
            <th className="px-6 py-4">Fee</th>
            <th className="px-6 py-4">Paid</th>
            <th className="px-6 py-4">Balance</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Graduation</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y text-gray-900">
          {filteredRecords.map((record, index) => (
            <motion.tr
              key={record.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="group text-gray-900 transition hover:bg-gray-50"
            >
              <td className="px-6 py-5 text-gray-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                    <User size={18} />
                  </div>

                  <span className="font-semibold text-gray-900">
                    {record.students?.full_name ?? "Unknown"}
                  </span>
                </div>
              </td>

              <td className="px-6 py-5 text-gray-900">
                <div className="flex items-center gap-2">
                  <Building2
                    size={16}
                    className="text-gray-400"
                  />

                  <span className="text-sm font-medium text-gray-900">
                    {record.institution}
                  </span>
                </div>
              </td>

              <td className="px-6 py-5 text-sm text-gray-900">
                {record.program || "—"}
              </td>

              <td className="px-6 py-5 text-sm text-gray-900">
                {record.level || "—"}
              </td>

              <td className="px-6 py-5 text-sm font-semibold text-gray-900">
                ${Number(record.university_fee || 0).toFixed(2)}
              </td>

              <td className="px-6 py-5 text-sm font-semibold text-green-600">
                ${Number(record.amount_paid || 0).toFixed(2)}
              </td>

              <td className="px-6 py-5 text-sm font-semibold text-orange-600">
                $
                {Number(
                  record.remaining_balance || 0
                ).toFixed(2)}
              </td>

              <td className="px-6 py-5 text-gray-900">
                <StatusBadge status={record.status} />
              </td>

              <td className="px-6 py-5 text-sm text-gray-900">
                {record.status === "Graduated"
                  ? record.graduation_date || "—"
                  : "—"}
              </td>

              <td className="px-6 py-5 text-gray-900">
                <div className="flex justify-end gap-2 opacity-70 transition group-hover:opacity-100">
                  <button
                    onClick={() => openEditModal(record)}
                    className="rounded-lg p-2 text-gray-900 hover:bg-gray-200"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    onClick={() => deleteRecord(record)}
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
      <div className="px-6 py-16 text-center text-gray-900">
        <BookOpen
          size={40}
          className="mx-auto text-gray-300"
        />

        <p className="mt-4 font-semibold text-gray-900">
          No education records found
        </p>

        <p className="mt-1 text-sm text-gray-400">
          Add an education record to start tracking students.
        </p>
      </div>
    )}

    {loading && (
      <div className="px-6 py-16 text-center text-gray-400">
        Loading education records...
      </div>
    )}
  </motion.div>

  <AnimatePresence>
    {modalOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 text-gray-900 backdrop-blur-sm"
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
          className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white text-gray-900 shadow-2xl"
        >
          <div className="flex shrink-0 items-center justify-between border-b px-6 py-5">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                {editingRecord
                  ? "Edit Education"
                  : "Add Education"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Education, fees, sponsors and graduation.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl p-2 text-gray-900 transition hover:bg-gray-100"
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
            <form id="education-form" onSubmit={saveRecord}>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
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
                    className="w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
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

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    University / Institution *
                  </label>

                  <input
                    value={form.institution}
                    onChange={(e) =>
                      updateField(
                        "institution",
                        e.target.value
                      )
                    }
                    placeholder="University of Hargeisa"
                    className="w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/5"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Program / Course
                  </label>

                  <input
                    value={form.program}
                    onChange={(e) =>
                      updateField(
                        "program",
                        e.target.value
                      )
                    }
                    placeholder="Computer Science"
                    className="w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/5"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Education Level
                  </label>

                  <select
                    value={form.level}
                    onChange={(e) =>
                      updateField(
                        "level",
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
                  >
                    <option value="">
                      Select level...
                    </option>
                    <option value="Primary">
                      Primary
                    </option>
                    <option value="Secondary">
                      Secondary
                    </option>
                    <option value="Diploma">
                      Diploma
                    </option>
                    <option value="Bachelor">
                      Bachelor's Degree
                    </option>
                    <option value="Master">
                      Master's Degree
                    </option>
                    <option value="PhD">
                      PhD
                    </option>
                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      updateField(
                        "start_date",
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Expected / End Date
                  </label>

                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) =>
                      updateField(
                        "end_date",
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <DollarSign size={20} />
                      </div>

                      <div>
                        <h3 className="font-bold text-blue-900">
                          University Fees
                        </h3>

                        <p className="text-xs text-blue-700">
                          Track the education cost and payments.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-900">
                          University Fee
                        </label>

                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.university_fee}
                            onChange={(e) =>
                              updateField(
                                "university_fee",
                                e.target.value
                              )
                            }
                            placeholder="2000"
                            className="w-full rounded-xl border bg-white py-3 pl-9 pr-4 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-900">
                          Amount Paid
                        </label>

                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.amount_paid}
                            onChange={(e) =>
                              updateField(
                                "amount_paid",
                                e.target.value
                              )
                            }
                            placeholder="500"
                            className="w-full rounded-xl border bg-white py-3 pl-9 pr-4 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-900">
                          Remaining Balance
                        </label>

                        <div className="flex h-[50px] items-center rounded-xl border bg-gray-100 px-4 font-bold text-orange-600">
                          ${remainingBalance.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-5">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white">
                          <Users size={20} />
                        </div>

                        <div>
                          <h3 className="font-bold text-purple-900">
                            Education Sponsors
                          </h3>

                          <p className="text-xs text-purple-700">
                            Multiple people can sponsor the same student.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={addSponsor}
                        className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-purple-700"
                      >
                        <Plus size={16} />
                        Add Sponsor
                      </button>
                    </div>

                    {loadingSponsors && (
                      <div className="py-6 text-center text-sm text-gray-500">
                        Loading sponsors...
                      </div>
                    )}

                    {!loadingSponsors &&
                      sponsors.length === 0 && (
                        <div className="rounded-xl border border-dashed bg-white px-5 py-8 text-center text-gray-900">
                          <Users
                            size={30}
                            className="mx-auto text-gray-300"
                          />

                          <p className="mt-3 text-sm font-semibold text-gray-900">
                            No sponsors added
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Click "Add Sponsor" to add someone paying the student's fees.
                          </p>
                        </div>
                      )}

                    <div className="space-y-3">
                      <AnimatePresence>
                        {sponsors.map((sponsor, index) => (
                          <motion.div
                            key={sponsor.id ?? `new-${index}`}
                            initial={{
                              opacity: 0,
                              y: -10,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            exit={{
                              opacity: 0,
                              height: 0,
                            }}
                            className="grid gap-3 rounded-xl border bg-white p-4 text-gray-900 md:grid-cols-[1fr_180px_auto]"
                          >
                            <div>
                              <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                                Sponsor Name
                              </label>

                              <input
                                value={sponsor.sponsor_name}
                                onChange={(e) =>
                                  updateSponsor(
                                    index,
                                    "sponsor_name",
                                    e.target.value
                                  )
                                }
                                placeholder="Sponsor name"
                                className="w-full rounded-lg border px-3 py-2.5 text-gray-900 outline-none placeholder:text-gray-400 focus:border-purple-600"
                              />
                            </div>

                            <div>
                              <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                                Amount
                              </label>

                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                  $
                                </span>

                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={sponsor.amount}
                                  onChange={(e) =>
                                    updateSponsor(
                                      index,
                                      "amount",
                                      e.target.value
                                    )
                                  }
                                  placeholder="500"
                                  className="w-full rounded-lg border py-2.5 pl-8 pr-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-purple-600"
                                />
                              </div>
                            </div>

                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() =>
                                  removeSponsor(index)
                                }
                                className="rounded-lg p-2.5 text-red-500 transition hover:bg-red-50"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {sponsors.length > 0 && (
                      <div className="mt-4 flex items-center justify-between rounded-xl bg-purple-100 px-4 py-3">
                        <span className="text-sm font-semibold text-purple-900">
                          Total Sponsor Contributions
                        </span>

                        <span className="text-lg font-black text-purple-700">
                          ${totalSponsorAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Education Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      handleStatusChange(e.target.value)
                    }
                    className="w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
                  >
                    <option value="Studying">
                      Studying
                    </option>

                    <option value="Graduated">
                      Graduated
                    </option>

                    <option value="Paused">
                      Paused
                    </option>

                    <option value="Dropped">
                      Dropped
                    </option>
                  </select>
                </div>

                <AnimatePresence>
                  {form.status === "Graduated" && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        height: 0,
                        y: -10,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                        y: -10,
                      }}
                      transition={{ duration: 0.3 }}
                      className="md:col-span-2 overflow-hidden"
                    >
                      <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-5">
                        <div className="mb-5 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow-sm">
                            <GraduationCap size={20} />
                          </div>

                          <div>
                            <h3 className="font-bold text-green-900">
                              Graduation Information
                            </h3>

                            <p className="text-xs text-green-700">
                              Complete the student's graduation details.
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-900">
                              Graduation Date *
                            </label>

                            <input
                              type="date"
                              value={form.graduation_date}
                              onChange={(e) =>
                                updateField(
                                  "graduation_date",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-500/10"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-900">
                              Certificate Name
                            </label>

                            <input
                              value={form.certificate_name}
                              onChange={(e) =>
                                updateField(
                                  "certificate_name",
                                  e.target.value
                                )
                              }
                              placeholder="Bachelor of Computer Science"
                              className="w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-green-600 focus:ring-2 focus:ring-green-500/10"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-gray-900">
                              Certificate Number
                            </label>

                            <input
                              value={form.certificate_number}
                              onChange={(e) =>
                                updateField(
                                  "certificate_number",
                                  e.target.value
                                )
                              }
                              placeholder="Certificate / Graduation ID"
                              className="w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-green-600 focus:ring-2 focus:ring-green-500/10"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-gray-900">
                              Graduation Notes
                            </label>

                            <textarea
                              value={form.graduation_notes}
                              onChange={(e) =>
                                updateField(
                                  "graduation_notes",
                                  e.target.value
                                )
                              }
                              rows={4}
                              placeholder="Additional graduation information..."
                              className="w-full resize-none rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-green-600 focus:ring-2 focus:ring-green-500/10"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>

          <div className="flex shrink-0 justify-end gap-3 border-t bg-gray-50 px-6 py-4 md:px-8">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border bg-white px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="education-form"
              disabled={saving}
              className="rounded-xl bg-black px-7 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingRecord
                ? "Update Education"
                : "Create Education"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
</div>



}

function StatusBadge({
status,
}: {
status: string | null;
}) {
const styles: Record<string, string> = {
Studying:
"bg-blue-50 text-blue-700 border-blue-100",
Graduated:
  "bg-green-50 text-green-700 border-green-100",

Paused:
  "bg-yellow-50 text-yellow-700 border-yellow-100",

Dropped:
  "bg-red-50 text-red-700 border-red-100",


};

return (
<span
className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
        styles[status ?? ""] ??
        "bg-gray-50 text-gray-600 border-gray-100"
      }`}
>
{status || "Unknown"} </span>
);
}
