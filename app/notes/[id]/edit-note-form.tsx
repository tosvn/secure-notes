"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateNote, type NoteActionState } from "../../actions";
import Brand from "../../brand";

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
    <section className="rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-[0_24px_70px_-30px_rgba(54,65,112,0.28)] backdrop-blur sm:p-8">
      <Brand />
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Edit your note
      </h1>
      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="title"
          >
            Title
          </label>
          <input
            className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            id="title"
            name="title"
            type="text"
            defaultValue={title}
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
            className="min-h-48 resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            id="body"
            name="body"
            rows={8}
            defaultValue={body}
          />
        </div>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            className="min-h-12 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save changes"}
          </button>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            href="/"
          >
            Cancel
          </Link>
        </div>
      </form>
      {state.message && (
        <p
          className={`mt-4 text-sm ${state.isError ? "text-rose-700" : "text-emerald-700"}`}
          role={state.isError ? "alert" : undefined}
          aria-live="polite"
        >
          {state.message}
        </p>
      )}
    </section>
  );
}
