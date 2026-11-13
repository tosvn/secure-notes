import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import EditNoteForm from "./edit-note-form";

type EditNotePageProps = {
  params: Promise<{ id: string }>;
};

function EditNoteFallback() {
  return (
    <div
      className="h-96 animate-pulse rounded-[1.75rem] bg-white/70"
      aria-label="Loading note"
    />
  );
}

async function EditNote({ params }: EditNotePageProps) {
  await connection();
  const { id } = await params;
  if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id)) {
    notFound();
  }

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

  const { data: note, error } = await supabase
    .from("notes")
    .select("id, title, body")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load note: ${error.message}`);
  }

  if (!note) {
    notFound();
  }

  return (
    <EditNoteForm noteId={note.id} title={note.title} body={note.body} />
  );
}

export default function EditNotePage(props: EditNotePageProps) {
  return (
    <main className="flex-1 px-4 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Suspense fallback={<EditNoteFallback />}>
          <EditNote params={props.params} />
        </Suspense>
      </div>
    </main>
  );
}
