"use client";

import { useActionState } from "react";
import { addNote, type NoteActionState } from "./actions";

const initialState: NoteActionState = { message: "", isError: false };

export default function NewNoteForm() {
  const [state, formAction, isPending] = useActionState(addNote, initialState);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
        New note
      </h2>
      <form action={formAction} className="mt-4 flex flex-col gap-4">
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
            className="min-h-32 resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            id="body"
            name="body"
            rows={5}
          />
        </div>
        <button
          className="min-h-11 w-full rounded-lg bg-blue-700 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:self-start"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save note"}
        </button>
      </form>
      {state.message && (
        <p
          className={`mt-3 text-sm ${state.isError ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400"}`}
          aria-live="polite"
        >
          {state.message}
        </p>
      )}
    </section>
  );
}
