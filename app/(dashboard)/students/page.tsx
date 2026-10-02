import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import StudentsClient from "./students-client";

export default async function StudentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: students, error } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">Students</h1>
        <p className="mt-2 text-red-500">
          Failed to load students: {error.message}
        </p>
      </div>
    );
  }

  return <StudentsClient initialStudents={students ?? []} />;
}