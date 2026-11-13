"use client";

import { useActionState } from "react";
import { addNote, type NoteActionState } from "./actions";

const initialState: NoteActionState = { message: "", isError: false };

export default function NewNoteForm() {
  const [state, formAction, isPending] = useActionState(addNote, initialState);

  return (
    <section className="rounded-[1.75rem] border border-indigo-100 bg-gradient-to-br from-white via-white to-indigo-50/70 p-6 shadow-[0_20px_60px_-40px_rgba(79,70,229,0.4)] sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Capture a thought</h2>
          <p className="mt-1 text-sm text-slate-500">
            A quick note, safely tucked away.
          </p>
        </div>
      </div>
      <form action={formAction} className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="title"
          >
            Title
          </label>
          <input
            className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            id="title"
            name="title"
            type="text"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="body"
          >
            Note
          </label>
          <textarea
            className="min-h-36 resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            id="body"
            name="body"
            rows={5}
          />
        </div>
        <button
          className="min-h-12 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:self-start"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save note"}
        </button>
      </form>
      {state.message && (
        <p
          className={`mt-3 text-sm ${state.isError ? "text-rose-700" : "text-emerald-700"}`}
          aria-live="polite"
        >
          {state.message}
        </p>
      )}
    </section>
  );
}
