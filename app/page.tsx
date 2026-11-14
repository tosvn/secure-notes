import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "../lib/supabase/server";
import Dashboard from "./dashboard";

function DashboardFallback() {
  return (
    <main className="flex h-dvh overflow-hidden bg-[#f7f8fc] p-5">
      <div className="w-60 animate-pulse rounded-3xl bg-white/70" />
      <div className="ml-5 flex-1 animate-pulse rounded-3xl bg-white/70" />
    </main>
  );
}

async function HomeDashboard() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(`Unable to verify your account: ${userError.message}`);
  }

  if (!user) {
    redirect("/login");
  }

  const { data: notes, error } = await supabase
    .from("notes")
    .select("id, title, body, created_at, is_pinned, tags")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load notes: ${error.message}`);
  }

  return (
    <Dashboard
      notes={notes}
      userEmail={user.email ?? "your account"}
    />
  );
}

export default function Home() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <HomeDashboard />
    </Suspense>
  );
}
