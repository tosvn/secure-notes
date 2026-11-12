"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateNote, type NoteActionState } from "../../actions";

const initialState: NoteActionState = { message: "", isError: false };

type EditNoteFormProps = {
  noteId: string;
  title: string;
  body: string;
};

export default function EditNoteForm({
  noteId,
  title,
  body,
}: EditNoteFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateNote.bind(null, noteId),
    initialState,
  );

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
      <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
        Edit note
      </h1>
      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            htmlFor="title"
          >
            Title
          </label>
          <input
            className="min-h-11 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            id="title"
            name="title"
            type="text"
            defaultValue={title}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            htmlFor="body"
          >
            Note
          </label>
          <textarea
            className="min-h-48 resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            id="body"
            name="body"
            rows={8}
            defaultValue={body}
          />
        </div>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            className="min-h-11 rounded-lg bg-blue-700 px-5 py-2.5 font-medium text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save changes"}
          </button>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
            href="/"
          >
            Cancel
          </Link>
        </div>
      </form>
      {state.message && (
        <p
          className={`mt-4 text-sm ${state.isError ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400"}`}
          role={state.isError ? "alert" : undefined}
          aria-live="polite"
        >
          {state.message}
        </p>
      )}
    </section>
  );
}
