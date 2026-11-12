import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { logOut } from "./actions";
import NewNoteForm from "./new-note-form";
import DeleteNoteButton from "./notes/delete-note-button";
import { createClient } from "../lib/supabase/server";

function AccountFallback() {
  return (
    <div className="h-16 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
  );
}

function NotesFallback() {
  return (
    <div
      className="h-40 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800"
      aria-label="Loading notes"
    />
  );
}

async function AccountHeader() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Unable to load your account: ${error.message}`);
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <header className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="break-all text-sm text-zinc-600 dark:text-zinc-300">
        Logged in as{" "}
        <span className="font-medium text-zinc-950 dark:text-zinc-50">
          {user.email ?? "your account"}
        </span>
      </p>
      <form action={logOut}>
        <button
          className="min-h-10 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800 sm:w-auto"
          type="submit"
        >
          Log out
        </button>
      </form>
    </header>
  );
}

async function NotesList() {
  await connection();
  const supabase = await createClient();
  const { data: notes, error } = await supabase
    .from("notes")
    .select("id, title, body, created_at")
    .order("created_at", { ascending: false });

  return (
    <section aria-labelledby="notes-heading">
      <h2
        className="mb-4 text-xl font-semibold text-zinc-950 dark:text-zinc-50"
        id="notes-heading"
      >
        Your notes
      </h2>
      {error ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          role="alert"
        >
          Unable to load notes: {error.message}
        </p>
      ) : notes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          No notes yet. Add your first note above.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {notes.map((note) => (
            <li
              className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
              key={note.id}
            >
              <article>
                <h3 className="break-words text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  {note.title}
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
                <p className="mt-4 break-words whitespace-pre-wrap text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                  {note.body}
                </p>
                <div className="mt-5 flex flex-col gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800 sm:flex-row">
                  <Link
                    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    href={`/notes/${note.id}`}
                  >
                    Edit
                  </Link>
                  <DeleteNoteButton noteId={note.id} />
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Home() {
  return (
    <main className="flex-1 bg-zinc-50 px-4 py-6 dark:bg-black sm:py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Suspense fallback={<AccountFallback />}>
          <AccountHeader />
        </Suspense>
        <NewNoteForm />
        <Suspense fallback={<NotesFallback />}>
          <NotesList />
        </Suspense>
      </div>
    </main>
  );
}
