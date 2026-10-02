import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    studentsResult,
    educationResult,
    employmentResult,
    paymentsResult,
    sponsorsResult,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false }),

    supabase
      .from("education_records")
      .select("*"),

    supabase
      .from("employment_records")
      .select("*"),

    supabase
      .from("payments")
      .select("*")
      .order("payment_date", { ascending: false }),

    supabase
      .from("education_sponsors")
      .select("*"),
  ]);

  return (
    <DashboardClient
      students={studentsResult.data ?? []}
      education={educationResult.data ?? []}
      employment={employmentResult.data ?? []}
      payments={paymentsResult.data ?? []}
      sponsors={sponsorsResult.data ?? []}
    />
  );
}