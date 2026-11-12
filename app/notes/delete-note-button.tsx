"use client";

import { useActionState } from "react";
import { deleteNote, type NoteActionState } from "../actions";

const initialState: NoteActionState = { message: "", isError: false };

export default function DeleteNoteButton({ noteId }: { noteId: string }) {
  const [state, formAction, isPending] = useActionState(
    deleteNote.bind(null, noteId),
    initialState,
  );

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-start">
      <form action={formAction}>
        <button
          className="min-h-10 w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950 sm:w-auto"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Deleting..." : "Delete"}
        </button>
      </form>
      {state.message && state.isError && (
        <p className="text-sm text-red-700 dark:text-red-400" role="alert">
          {state.message}
        </p>
      )}
    </div>
  );
}
